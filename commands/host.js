'use strict';

const logger = require('../lib/logger');
const request = require('../lib/request');
const Table = require('../lib/table');
const utils = require('../lib/utils');

const _ = require('lodash');
const chalk = require('chalk');
const flatten = require('flat');
const unflatten = flatten.unflatten;

module.exports = {
    name: 'host',
    description: 'List and manipulate hosts running on the configured containership cluster.',
    commands: []
};

module.exports.commands.push({
    name: 'list',
    description: 'List hosts on the configured cluster.',
    callback: () => {
        return request.get('hosts', {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch hosts!');
            }

            const headers = [
                'ID',
                'START_TIME',
                'MODE',
                'CONTAINERS'
            ];

            const data = Object.keys(response.body).map(key => {
                const host = response.body[key];

                return [
                    host.id,
                    new Date(host.start_time).toString(),
                    `${host.mode} ${(host.praetor && host.praetor.leader) ? '*' : ''}`,
                    host.containers ? host.containers.length : 0
                ];
            });

            if(data.length === 0) {
                return logger.error('There are currently no hosts on the configured cluster!');
            }

            const output = Table.createTable(headers, data);
            return logger.info(output);
        });
    }
});

module.exports.commands.push({
    name: 'show <host_name>',
    description: 'Show requested host information.',
    callback: (argv) => {
        return request.get(`hosts/${argv.host_name}`, {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch host!');
            }

            if(response.statusCode === 404) {
                return logger.error(`Host ${argv.host_name} could not be found!`);
            }

            const headers = [
                'ID',
                'START_TIME',
                'MODE',
                'PUBLIC_IP',
                'PRIVATE_IP',
                'TAGS'
            ];

            const host = response.body;

            const tags = _.map(flatten(host.tags), (v, k) => {
                return `${chalk.gray(k)}: ${v}`;
            });

            const data = [
                host.id,
                new Date(host.start_time).toString(),
                host.mode,
                host.address.public,
                host.address.private,
                tags.join('\n')
            ];

            if(host.mode === 'follower') {
                headers.push(...[
                    'CPUS (USED / TOTAL)',
                    'MEMORY (USED / TOTAL)',
                    'CONTAINERS'
                ]);

                let used_cpus = 0;
                let used_memory = 0;
                host.containers.forEach((container) => {
                    used_cpus += parseFloat(container.cpus);
                    used_memory += parseFloat(container.memory);
                });
                const total_cpus = parseFloat(host.cpus).toFixed(3);
                const total_memory = parseInt(parseInt(host.memory) / (1024 * 1024));

                data.push(`${used_cpus.toFixed(3)} / ${total_cpus}`);
                data.push(`${used_memory} MB / ${total_memory} MB`);
                data.push(host.containers.length);
            }

            const output = Table.createVerticalTable(headers, [data]);
            return logger.info(output);
        });
    }
});

module.exports.commands.push({
    name: 'edit <host_name>',
    description: 'Edit host.',
    options: {
        tag: {
            description: 'Add/remove host tags.',
            alias: 't',
            array: true
        }
    },
    callback: (argv) => {
        let options = _.omit(argv, ['h', 'help', '$0', '_']);
        options = parse_update_body(options);

        return request.get(`hosts/${argv.host_name}`, {}, (err, response) => {
            if(err) {
                process.stderr.write(`Could not update host ${argv.host_name}!`);
                process.exit(1);
            }

            if(response.statusCode === 404) {
                return logger.error(`Host ${argv.host_name} could not be found!`);
            }

            const host = response.body;

            host.tags = flatten(host.tags);
            const to_remove_tag = _.keys(flatten(_.pickBy(options.tags, val => val !== false && !val)));
            to_remove_tag.forEach((key) => {
                delete host.tags[key];
            });

            const to_add_tag = flatten(_.pickBy(options.tags, val => val));
            options.tags = unflatten(_.merge(host.tags, to_add_tag));

            return request.put(`hosts/${argv.host_name}`, {}, options, (err, response) => {
                if(err) {
                    return logger.error(`Could not update host ${argv.host_name}!`);
                }

                if(response.statusCode !== 200) {
                    return logger.error(response.body.error);
                }

                return logger.info(`Successfully updated host ${argv.host_name}!`);
            });
        });
    }
});

module.exports.commands.push({
    name: 'disconnect <host_name>',
    description: 'Disconnect Containership agent on host.',
    callback: (argv) => {
        return request.delete(`hosts/${argv.host_name}`, {}, (err, response) => {
            if(err) {
                return logger.error(`Could not disconnect containership agent on host ${argv.host_name}!`);
            }

            if(response.statusCode === 404) {
                return logger.error(`Host ${argv.host_name} does not exist!`);
            }

            if(response.statusCode !== 204) {
                return logger.error(`Could not disconnect containership agent on host ${argv.host_name}!`);
            }

            return logger.info(`Successfully disconnected containership agent on host ${argv.host_name}!`);
        });
    }
});

function parse_update_body(options) {
    if(_.has(options, 'tag')) {
        options.tags = utils.parse_key_value_args(options.tag);
        delete options.tag;
        delete options.t;
    }

    return options;
}
