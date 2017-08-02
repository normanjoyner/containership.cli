'use strict';

const configuration = require('../lib/configuration');
const csUtils = require('../lib/utils');
const Table = require('../lib/table');

const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const mkdirp = require('mkdirp');
const npm = require('npm');
const request = require('request');
const rimraf = require('rimraf');
const tar = require('tar-fs');
const zlib  = require('zlib');

const PLUGIN_DIR = process.env.CS_PLUGIN_DIR || `${process.env.HOME}/.containership/plugins`;

module.exports = {
    name: 'client-plugin',
    description: 'List and manipulate plugins for Containership client.',
    commands: []
};

function sync(silent) {
    mkdirp.sync(PLUGIN_DIR);
    const potential_plugins = fs.readdirSync(`${PLUGIN_DIR}`).map(name => `${PLUGIN_DIR}/${name}`);

    const valid_plugins = _.reduce(potential_plugins, (accumulator, plugin_path) => {
        if(!fs.existsSync(`${plugin_path}/package.json`)) {
            console.info(`Not a valid containership plugin: ${plugin_path}`);
            return accumulator;
        }

        delete require.cache[require.resolve(plugin_path)];
        const req = require(plugin_path);
        const plugin = typeof req === 'function' ? new req().cli : req && req.cli;

        // is not a CS plugin, needs to export
        if(!plugin) {
            console.info(`Not a valid containership plugin: ${plugin_path}`);
            return accumulator;
        }

        const pkg = require(`${plugin_path}/package.json`);
        console.log(pkg.name);
        console.log(pkg.version);

        accumulator[pkg.name] = {
            name: pkg.name,
            version: pkg.version,
            path: plugin_path,
            description: plugin.description
        }

        return accumulator;
    }, {});

    const new_config = configuration.get();
    new_config.plugins = valid_plugins;
    configuration.set(new_config);

    if(silent) {
        return;
    }

    const headers = ['NAME', 'VERSION', 'DESCRIPTION', 'PATH'];

    const data = _.map(new_config.plugins, (plugin) => {
        return [
            plugin.name,
            plugin.version,
            csUtils.split_on_line_length(plugin.description, 48),
            csUtils.split_on_line_length(plugin.path, 48)
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
        sync(true);
        const conf = configuration.get();

        const headers = ['NAME', 'VERSION', 'DESCRIPTION', 'PATH'];

        const data = _.map(conf.plugins, (plugin) => {
            return [
                plugin.name,
                plugin.version,
                csUtils.split_on_line_length(plugin.description, 48),
                csUtils.split_on_line_length(plugin.path, 48)
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

        return fs.writeFile(`${PLUGIN_DIR}/${argv.plugin}.json`, JSON.stringify(config), (err) => {
            if(err) {
                return console.error(err.message);
            }

            return console.info(`Wrote ${argv.plugin}.json configuration file`);
        });
    }
});

const GITHUB_REGEX = /github:\/\/(.+)\/([^#]+)#?(.+)?/;
const NPM_REGEX = /(@[^\/]+)?\/?([^@]+)@?(.+)?/;

function parsePluginInput(input) {
    if(!input) {
        throw new Error('Must provide plugin input');
    }

    if(input.indexOf('github://') === 0) {
        const match = input.match(GITHUB_REGEX);

        if(!match) {
            throw new Error(`Invalid github format, expect: ${GITHUB_REGEX}`);
        }

        return {
            type: 'github',
            organization: match[1],
            name: match[2],
            version: match[3] || 'master'
        };
    }

    const match = input.match(NPM_REGEX);

    if(!match) {
        throw new Error(`Invalid npm format, expect: ${NPM_REGEX}`);
    }

    return {
        type: 'npm',
        organization: match[1],
        name: match[2],
        version: match[3] || 'latest'
    };
}

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

function modify_plugins(type, plugins, cb) {
    if(type !== 'add' && type !== 'upgrade') {
        throw Error('Type must be one of `add` or `upgrade` in the `modify_plugins` call');
    }

    const isAdd = type === 'add';
    const isUpgrade = type === 'upgrade';

    return async.waterfall([
        (cb) => npm.load({}, () => cb()),
        (cb) => {
            return getOfficialContainershipPlugins((err, plugins) => {
                // continue attempting to add plugins even if official plugin mapping is not reached
                if(err) {
                    console.warn(err);
                }

                return cb(null, plugins || null);
            });
        },
        (official_plugins, cb) => {
            return async.map(plugins, (plugin, cb) => {
                plugin = parsePluginInput(official_plugins[plugin] ? official_plugins[plugin].source : plugin);

                if(plugin.type === 'github') {
                    plugin.tarball = `https://api.github.com/repos/${plugin.organization}/${plugin.name}/tarball/${plugin.version}`;
                    return cb(null, plugin);
                }

                if(plugin.type === 'npm') {
                    let name = `${plugin.name}@${plugin.version}`;

                    if(plugin.organization) {
                        name = `${plugin.organization}/${name}`;
                    }

                    return npm.commands.view([name, 'dist.tarball'], (err, data) => {
                        if(err) {
                            return cb(err);
                        }

                        plugin.tarball = _.values(data)[0]['dist.tarball'];
                        return cb(null, plugin);
                    });
                }

                return cb('Invalid plugin type: ', plugin.type);
            }, cb);
        }
    ], (err, plugins) => {
        if(err) {
            throw new Error(err);
        }

        return async.eachSeries(plugins, (plugin, cb) => {
            const plugin_path = `${PLUGIN_DIR}/${plugin.name}`;

            if(isAdd && fs.existsSync(plugin_path)) {
                console.warn(`Skipping install of ${plugin_path}, directory already exists. Use 'client-plugin upgrade' to update an existing plugin.`);
                return cb();
            }

            if(isUpgrade && !fs.existsSync(plugin_path)) {
                console.warn(`Skipping install of ${plugin_path}, directory does not exist. Use 'client-plugin add' to add an new plugin.`);
                return cb();
            }


            // remove plugin before upgrade to new version
            if(isUpgrade) {
                rimraf.sync(plugin_path);
            }

            const extract_pipe = request({
                headers: {
                    'User-Agent': 'cli.containership.io'
                },
                url: plugin.tarball
            }).pipe(zlib.createGunzip()).pipe(tar.extract(plugin_path, {
                map: function(header) {
                    // strip the wrapper directory off of extraction
                    header.name = header.name.substring(header.name.indexOf('/'));
                    return header;
                }
            }));;

            function npm_install() {
                return npm.commands.install([plugin_path], (err) => {
                    if(err) {
                        return cb(err);
                    }

                    console.info('Succesfully installed!');
                    sync(true);
                    return cb();
                });
            }

            extract_pipe.on('finish', npm_install);
            extract_pipe.on('error', (err) => {
                console.error(err);
                return cb(err);
            });
        });
    });
}

module.exports.commands.push({
    name: 'add <plugins...>',
    description: 'Add plugins.',
    callback: (argv) => {
        return modify_plugins('add', argv.plugins, (err) => {
            if(err) {
                return console.error(err);
            }

            return console.info('Succesfully added all plugins!');
        });
    }
});

module.exports.commands.push({
    name: 'upgrade <plugins...>',
    description: 'Upgrade plugins.',
    callback: (argv) => {
        return modify_plugins('upgrade', argv.plugins, (err) => {
            if(err) {
                return console.error(err);
            }

            return console.info('Succesfully upgraded all plugins!');
        });
    }
});

module.exports.commands.push({
    name: 'remove <plugins...>',
    description: 'Removes a plugin.',
    callback: (argv) => {
        sync(true);

        return getOfficialContainershipPlugins((err, official_plugins) => {
            if(err) {
                return console.error(err);
            }

            const configured_plugins = configuration.get().plugins;

            return _.forEach(argv.plugins, (plugin_name) => {
                plugin_name = official_plugins[plugin_name] ? official_plugins[plugin_name].source : plugin_name;
                const plugin = configured_plugins[plugin_name];

                if(!plugin) {
                    console.warn(`The plugin is not configured, skipping: ${plugin_name}`);
                    return true;
                }

                if(plugin.path.indexOf(PLUGIN_DIR)) {
                    return console.warn(`Plugin path has been modified and is not consistent with the base plugin directory... not removing: ${plugin.path}`);
                }

                return rimraf.sync(configured_plugins[plugin_name].path);
            });

            sync(true);
        });
    }
});
