'use strict';

const configuration = require('../lib/configuration');
const csUtils = require('../lib/utils');
const Table = require('../lib/table');

const _ = require('lodash');
const fs = require('fs');
const npm = require('npm');
const request = require('request');

const PLUGIN_DIR = `${process.env.HOME}/.containership/plugins`;

module.exports = {
    name: 'client-plugin',
    description: 'List and manipulate plugins for Containership client.',
    commands: []
};

function sync(silent) {
    const potential_plugins = fs.readdirSync(`${PLUGIN_DIR}/node_modules`);
    const valid_plugins = {};

    _.forEach(potential_plugins, (plugin_name) => {
        if (!plugin_name.startsWith('containership.plugin.')) {
            return;
        }

        const plugin_path = `${PLUGIN_DIR}/node_modules/${plugin_name}`;

        let req;

        try{
            delete require.cache[require.resolve(plugin_path)];
            req = require(plugin_path);
        } catch(e) {
            if(e) { /* ignore */ }
        }

        let plugin = typeof req === 'function' ? new req().cli : req && req.cli;

        if(plugin) {
            valid_plugins[plugin_name.replace('containership.plugin.', '')] = {
                path: plugin_path
            };
        }
    });

    const new_config = configuration.get();
    new_config.plugins = valid_plugins;
    configuration.set(new_config);

    if(silent) {
        return;
    }

    const headers = ['NAME', 'VERSION', 'DESCRIPTION', 'PATH'];

    const data = _.map(new_config.plugins, (plugin) => {
        const plugin_path = plugin.path;

        plugin = require(plugin_path);
        plugin = typeof plugin === 'function' ? new plugin().cli : plugin && plugin.cli;

        return[
            plugin.name,
            require(`${plugin_path}/package.json`).version,
            csUtils.split_on_line_length(plugin.description, 48),
            csUtils.split_on_line_length(plugin_path, 48)
        ];
    });

    if(data.length === 0) {
        return console.error('You have no valid client plugins configured');
    }

    const output = Table.createTable(headers, data, {
        colWidths: [null, null, 50, 50]
    });

    return console.info(output);
}

module.exports.commands.push({
    name: 'sync',
    description: 'Sync all plugins installed into your cli configuration',
    callback: () => {
        return sync();
    }
});

module.exports.commands.push({
    name: 'list',
    description: 'List installed plugins.',
    callback: () => {
        const conf = configuration.get();

        const headers = ['NAME', 'VERSION', 'DESCRIPTION', 'PATH'];

        const data = _.map(conf.plugins, (plugin) => {
            const plugin_path = plugin.path;

            plugin = require(plugin_path);
            plugin = typeof plugin === 'function' ? new plugin().cli : plugin && plugin.cli;

            return[
                plugin.name,
                require(`${plugin_path}/package.json`).version,
                csUtils.split_on_line_length(plugin.description, 48),
                csUtils.split_on_line_length(plugin_path, 48)
            ];
        });

        if(data.length === 0) {
            return console.error('You have no valid client plugins configured');
        }

        const output = Table.createTable(headers, data, {
            colWidths: [null, null, 50, 50]
        });

        return console.info(output);
    }
});

module.exports.commands.push({
    name: 'configure <plugin>',
    description: 'Configure plugins.',
    callback: (argv) => {
        const undesiredKeys = ['_', 'help', 'h', '$0', 'plugin'];
        const config = _.omit(argv, undesiredKeys);

        fs.writeFile(`${PLUGIN_DIR}/${argv.plugin}.json`, JSON.stringify(config), (err) => {
            if(err) {
                return console.error(err.message);
            }

            return console.info(`Wrote ${argv.plugin}.json configuration file`);
        });
    }
});

function getOfficialContainershipPlugins(callback) {
    return request({ url: 'https://plugins.containership.io', json: true }, (err, response) => {
        if(err) {
            return callback(err);
        }

        if(response.statusCode !== 200) {
            return callback('Failed to search for plugins.');
        }

        return callback(null, response.body);
    });
}

module.exports.commands.push({
    name: 'search [name]',
    description: 'Search plugins.',
    callback: (argv) => {
        return getOfficialContainershipPlugins((err, plugins) => {
            if(err) {
                return console.error(err);
            }

            const headers = ['NAME', 'SOURCE', 'DESCRIPTION'];

            const data = _.map(plugins, (plugin, name) => {
                if(argv.name && !name.includes(argv.name)) {
                    return;
                }

                return[
                    name,
                    plugin.source,
                    csUtils.split_on_line_length(plugin.description, 98)
                ];
            }).filter(v => v);

            const output = Table.createTable(headers, data, {
                colWidths: [null, null, 100]
            });

            return console.info(output);
        });
    }
});

function modify_plugin(options) {
    let isUpgrade = options.type === 'upgrade';
    let isRemove = options.type === 'remove';
    let isAdd = options.type === 'add';
    let official_plugins = options.official_plugins || [];
    let plugin_name = options.plugin_name;
    plugin_name = plugin_name.split('@');

    let plugin = plugin_name[0];
    let version = plugin_name[1];

    const official_plugin = official_plugins[plugin];

    let source = official_plugin ? official_plugin.source : plugin;
    plugin = source;

    if(version) {
        source = `${source}@${version}`;
    }

    let branchIndex = plugin.indexOf('#');
    let orgIndex = plugin.charAt === '@' ? -1 : plugin.indexOf('/') + 1;

    if(branchIndex === -1) {
        branchIndex = plugin.length;
    }

    if(orgIndex === -1) {
        orgIndex = 0;
    }

    const module_search = plugin.substring(orgIndex, branchIndex);

    return npm.load({
        loglevel: 'silent',
        force: true,
        prefix: PLUGIN_DIR,
        'unsafe-perm': true
    }, () => {
        return npm.commands.ls([ module_search ], { json: true }, (err, data) => {
            if(err) {
                return console.error('Failed to add plugin!');
            }

            if(isAdd && _.keys(data.dependencies).indexOf(module_search) !== -1) {
                return console.error(`Plugin ${module_search} is already installed, please see 'csctl client-plugin upgrade' for upgrading existing plugins.`);
            }

            if((isRemove || isUpgrade) && _.keys(data.dependencies).indexOf(module_search) === -1) {
                return console.error(`Plugin ${module_search} is not already installed, please see 'csctl client-plugin add' for installing new plugins.`);
            }

            const npm_cmd = (isAdd || isUpgrade) ? 'install' : 'remove';

            return npm.commands[npm_cmd]([isRemove ? module_search : source], (err) => {
                if(err) {
                    console.error(`Failed to ${options.type} plugin!`);
                    return console.error(err.message);
                }

                sync(true);

                let msg = `Succesfully removed the ${plugin} plugin!`;

                if(isAdd || isUpgrade) {
                    msg = `Succesfully ${options.type}d the ${plugin} plugin!`;
                }

                return console.info(msg);
            });
        });
    });
}

module.exports.commands.push({
    name: 'add <plugins...>',
    description: 'Add plugins.',
    callback: (argv) => {
        return getOfficialContainershipPlugins((err, official_plugins) => {
            if(err) {
                return console.error(err);
            }

            return _.forEach(argv.plugins, (plugin) => {
                return modify_plugin({
                    plugin_name: plugin,
                    official_plugins: official_plugins,
                    type: 'add'
                });
            });
        });
    }
});

module.exports.commands.push({
    name: 'upgrade <plugins...>',
    description: 'Upgrade plugins.',
    callback: (argv) => {
        return getOfficialContainershipPlugins((err, official_plugins) => {
            if(err) {
                return console.error(err);
            }

            return _.forEach(argv.plugins, (plugin) => {
                return modify_plugin({
                    plugin_name: plugin,
                    official_plugins: official_plugins,
                    type: 'upgrade'
                });
            });
        });
    }
});

module.exports.commands.push({
    name: 'remove <plugins...>',
    description: 'Removes a plugin.',
    callback: (argv) => {
        return getOfficialContainershipPlugins((err, official_plugins) => {
            if(err) {
                return console.error(err);
            }

            return _.forEach(argv.plugins, (plugin) => {
                return modify_plugin({
                    plugin_name: plugin,
                    official_plugins: official_plugins,
                    type: 'remove'
                });
            });
        });
    }
});
