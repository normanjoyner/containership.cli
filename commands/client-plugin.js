'use strict';

const configuration = require('../lib/configuration');
const csUtils = require('../lib/utils');
const logger = require('../lib/logger');
const Table = require('../lib/table');

const _ = require('lodash');
const async = require('async');
const child_process = require('child_process');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const request = require('request');
const rimraf = require('rimraf');
const tar = require('tar-fs');
const zlib = require('zlib');

const NPM_FILE = path.resolve(`${__dirname}/../node_modules/.bin/npm`);
const PLUGIN_DIR = process.env.CS_PLUGIN_DIRECTORY || `${process.env.HOME}/.containership/plugins`;
const PLUGIN_CONFIG_DIR = process.env.CS_PLUGIN_CONFIG_DIRECTORY || `${process.env.HOME || '/root'}/.containership/config`;

mkdirp.sync(PLUGIN_DIR);
mkdirp.sync(PLUGIN_CONFIG_DIR);

module.exports = {
    name: 'client-plugin',
    description: 'List and manipulate plugins for Containership client.',
    commands: []
};

function sync(silent) {
    const potential_plugins = fs.readdirSync(`${PLUGIN_DIR}`).map(name => `${PLUGIN_DIR}/${name}`);

    const valid_plugins = _.reduce(potential_plugins, (accumulator, plugin_path) => {
        if(!fs.existsSync(`${plugin_path}/package.json`)) {
            logger.info(`Not a valid containership plugin: ${plugin_path}`);
            return accumulator;
        }

        delete require.cache[require.resolve(plugin_path)];
        const req = require(plugin_path);
        const plugin = typeof req === 'function' ? new req().cli : req && req.cli;

        // is not a CS plugin, needs to export
        if(!plugin) {
            logger.info(`Not a valid containership plugin: ${plugin_path}`);
            return accumulator;
        }

        const pkg = require(`${plugin_path}/package.json`);

        accumulator[pkg.name] = {
            name: pkg.name,
            version: pkg.version,
            path: plugin_path,
            description: plugin.description
        };

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
        return logger.error('You have no valid client plugins configured');
    }

    const output = Table.createTable(headers, data, {
        colWidths: [null, null, 50, 50]
    });

    return logger.info(output);
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
            return logger.error('You have no valid client plugins configured');
        }

        const output = Table.createTable(headers, data, {
            colWidths: [null, null, 50, 50]
        });

        return logger.info(output);
    }
});

module.exports.commands.push({
    name: 'configure <plugin>',
    description: 'Configure plugins.',
    callback: (argv) => {
        const undesiredKeys = ['_', 'help', 'h', '$0', 'plugin'];
        const config = _.omit(argv, undesiredKeys);

        return fs.writeFile(`${PLUGIN_CONFIG_DIR}/${argv.plugin}.json`, JSON.stringify(config), (err) => {
            if(err) {
                return logger.error(err.message);
            }

            return logger.info(`Wrote ${argv.plugin}.json configuration file`);
        });
    }
});

const GITHUB_REGEX = /github:\/\/(.+)\/([^#]+)#?(.+)?/;
const NPM_REGEX = /(@[^/]+)?\/?([^@]+)@?(.+)?/;

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
                return logger.error(err);
            }

            const headers = ['NAME', 'SOURCE', 'DESCRIPTION'];

            const data = _.map(plugins, (plugin, name) => {
                if(argv.name && !name.includes(argv.name)) {
                    return;
                }

                return [
                    name,
                    plugin.source,
                    csUtils.split_on_line_length(plugin.description, 98)
                ];
            }).filter(v => v);

            const output = Table.createTable(headers, data, {
                colWidths: [null, null, 100]
            });

            return logger.info(output);
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
        (cb) => {
            return getOfficialContainershipPlugins((err, plugins) => {
                // continue attempting to add plugins even if official plugin mapping is not reached
                if(err) {
                    logger.warn(err);
                }

                // we don't want it to default to undefined
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

                    const spawn_result = child_process.spawnSync(NPM_FILE, ['view', name, 'dist.tarball']);

                    if(spawn_result.status !== 0) {
                        return cb(spawn_result.error || spawn_result.stderr.toString());
                    }

                    plugin.tarball = spawn_result.stdout.toString().trim();
                    return cb(null, plugin);
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
                logger.warn(`Skipping install of ${plugin_path}, directory already exists. Use 'client-plugin upgrade' to update an existing plugin.`);
                return cb();
            }

            if(isUpgrade && !fs.existsSync(plugin_path)) {
                logger.warn(`Skipping install of ${plugin_path}, directory does not exist. Use 'client-plugin add' to add an new plugin.`);
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
            }));

            function npm_install() {
                const install = child_process.spawn(NPM_FILE, ['install'], {
                    cwd: plugin_path
                });

                install.stdout.pipe(process.stdout);
                install.stderr.pipe(process.stderr);
                install.on('close', (code) => {
                    if(code !== 0) {
                        return cb(`NPM Install: ${plugin_path} failed with exit code ${code}`);
                    }

                    return cb();
                });
            }

            extract_pipe.on('finish', npm_install);
            extract_pipe.on('error', (err) => {
                logger.error(err);
                return cb(err);
            });
        }, cb);
    });
}

module.exports.commands.push({
    name: 'add <plugins...>',
    description: 'Add plugins.',
    callback: (argv) => {
        return modify_plugins('add', argv.plugins, (err) => {
            if(err) {
                return logger.error(err);
            }

            return logger.info('Succesfully added all plugins!');
        });
    }
});

module.exports.commands.push({
    name: 'upgrade <plugins...>',
    description: 'Upgrade plugins.',
    callback: (argv) => {
        return modify_plugins('upgrade', argv.plugins, (err) => {
            if(err) {
                return logger.error(err);
            }

            return logger.info('Succesfully upgraded all plugins!');
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
                return logger.error(err);
            }

            const configured_plugins = configuration.get().plugins;

            _.forEach(argv.plugins, (plugin_name) => {
                plugin_name = official_plugins[plugin_name] ? official_plugins[plugin_name].source : plugin_name;
                const plugin = configured_plugins[plugin_name];

                if(!plugin) {
                    logger.warn(`The plugin is not configured, skipping: ${plugin_name}`);
                    return true;
                }

                if(plugin.path.indexOf(PLUGIN_DIR)) {
                    return logger.warn(`Plugin path has been modified and is not consistent with the base plugin directory... not removing: ${plugin.path}`);
                }

                return rimraf.sync(configured_plugins[plugin_name].path);
            });

            sync(true);
        });
    }
});
