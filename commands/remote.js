'use strict';

const configuration = require('../lib/configuration');
const csUtils = require('../lib/utils');
const logger = require('../lib/logger');
const Table = require('../lib/table');

const _ = require('lodash');

const DEFAULT_API_VERSION = 'v1';

module.exports = {
    name: 'remote',
    description: 'Commands for manipulating remotes pointing to Containership clusters.',
    commands: []
};

module.exports.commands.push({
    name: 'add <remote_name> <remote_url>',
    description: 'Add a remote pointing to a containership cluster.',
    callback: (argv) => {
        const conf = configuration.get();

        const remote_name = argv.remote_name;

        if(conf.remotes[remote_name]) {
            return logger.error(`Remote ${remote_name} already exists!`);
        }

        conf.remotes[remote_name] = {
            url: argv.remote_url,
            version: DEFAULT_API_VERSION
        };
        configuration.set(conf);

        return logger.info('Succesfully created remote!');
    }
});

module.exports.commands.push({
    name: 'set-url <remote_name> <remote_url>',
    description: 'Set url on remote',
    callback: (argv) => {
        const conf = configuration.get();

        const remote_name = argv.remote_name;

        if(!conf.remotes[remote_name]) {
            return logger.error(`Remote ${remote_name} does not exist! See 'csctl remote add <remote_name> <remote_url>' for more info.`);
        }

        conf.remotes[remote_name].url = argv.remote_url;
        configuration.set(conf);

        return logger.info('Succesfully set remote url!');
    }
});

module.exports.commands.push({
    name: 'set-version <remote_name> <remote_version>',
    description: 'Set version on remote.',
    callback: (argv) => {
        const conf = configuration.get();

        const remote_name = argv.remote_name;

        if(!conf.remotes[remote_name]) {
            return logger.error(`Remote ${remote_name} does not exist! See 'csctl remote add <remote_name> <remote_url>' for more info.`);
        }

        conf.remotes[remote_name].version = argv.remote_version;
        configuration.set(conf);

        return logger.info('Succesfully set remote version!');
    }
});

module.exports.commands.push({
    name: 'set-active <remote_name>',
    description: 'Set a remote as the default active remote.',
    callback: (argv) => {
        const conf = configuration.get();

        const remote_name = argv.remote_name;

        if(!conf.remotes[remote_name]) {
            return logger.error(`Remote ${remote_name} does not exist! See 'csctl remote add <remote_name> <remote_url>' for more info.`);
        }

        conf.metadata.active_remote = argv.remote_name;
        configuration.set(conf);

        return logger.info(`Succesfully set ${remote_name} as active remote!`);
    }
});

module.exports.commands.push({
    name: 'remove <remote_name>',
    description: 'Remove a remote from the client.',
    callback: (argv) => {
        const conf = configuration.get();

        const remote_name = argv.remote_name;

        if(!conf.remotes[remote_name]) {
            return logger.error(`Remote ${remote_name} does not exist! See 'csctl remote add <remote_name> <remote_url>' for more info.`);
        }

        delete conf.remotes[remote_name];
        configuration.set(conf);

        return logger.info(`Succesfully removed ${remote_name} remote!`);
    }
});

module.exports.commands.push({
    name: 'list',
    description: 'List all configured remotes.',
    callback: () => {
        const conf = configuration.get();

        const active_remote = conf.metadata.active_remote;

        const data = _.map(conf.remotes, (info, name) => {
            if(active_remote === name) {
                name = `* ${name}`;
            }

            const url = csUtils.split_on_line_length(info.url, 98);
            return [name, info.version || 'v1', url];
        });

        if(data.length === 0) {
            return logger.error('There are currently no remotes configured!');
        }

        const headers = ['NAME', 'VERSION', 'URL'];
        const output = Table.createTable(headers, data, {
            colWidths: [null, null, 100]
        });

        logger.info(output);
    }
});
