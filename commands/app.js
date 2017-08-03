'use strict';

const logger = require('../lib/logger');
const request = require('../lib/request');
const Table = require('../lib/table');
const utils = require('../lib/utils');

const _ = require('lodash');
const chalk = require('chalk');
const flatten = require('flat');
const unflatten = flatten.unflatten;

const application_options = {
    engine: {
        description: 'Engine used to start application',
        alias: 'x'
    },
    image: {
        description: 'Application image',
        alias: 'i'
    },
    'env-var': {
        array: true,
        description: 'Environment variable for application',
        alias: 'e'
    },
    'network-mode': {
        description: 'Application network mode',
        alias: 'n'
    },
    'container-port': {
        description: 'Port application must listen on',
        alias: 'p'
    },
    command: {
        description: 'Application start command',
        alias: 's'
    },
    volume: {
        description: 'Volume to bind-mount for application',
        array: true,
        alias: 'b'
    },
    tag: {
        description: 'Tag to add to application',
        array: true,
        alias: 't'
    },
    cpus: {
        description: 'CPUs allocated to application',
        alias: 'c'
    },
    memory: {
        description: 'Memory (mb) allocated to application',
        alias: 'm'
    },
    privileged: {
        description: 'Run application containers in privileged mode',
        boolean: true
    },
    respawn: {
        description: 'Respawn application containers when they die',
        boolean: true,
        default: true
    }
};

module.exports = {
    name: 'app',
    description: 'List and manipulate applications running on the cluster specified by the client remote.',
    commands: []
};

module.exports.commands.push({
    name: 'list',
    description: 'List applications on the cluster.',
    callback: () => {
        return request.get('applications', {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch applications!');
            }

            const headers = [
                'ID',
                'IMAGE',
                'COMMAND',
                'CPUS',
                'MEMORY',
                'CONTAINERS'
            ];

            const data = Object.keys(response.body).map(key => {
                const app = response.body[key];
                const loaded_containers = app.containers.reduce((accumulator, container) => {
                    if(container.status === 'loaded') {
                        accumulator++;
                    }

                    return accumulator;
                }, 0);

                return [
                    app.id,
                    app.image,
                    app.command,
                    app.cpus,
                    app.memory,
                    `${loaded_containers || 0}/${app.containers.length}`
                ];
            });

            if(data.length === 0) {
                return logger.error('You currently have no applications configured on the cluster!');
            }

            const output = Table.createTable(headers, data);
            return logger.info(output);
        });
    }
});

module.exports.commands.push({
    name: 'show <app_name>',
    description: 'Show detailed information for specified application.',
    callback: (argv) => {
        return request.get(`applications/${argv.app_name}`, {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch application!');
            }

            if(response.statusCode === 404) {
                return logger.error(`Application ${argv.app_name} was not found!`);
            }

            const app = response.body;

            const headers = [
                'IMAGE',
                'DISCOVERY_PORT',
                'COMMAND',
                'ENGINE',
                'NETWORK_MODE',
                'CONTAINER_PORT',
                'CPUS',
                'MEMORY',
                'RESPAWN',
                'PRIVLEGED',
                'ENV_VARS',
                'VOLUMES',
                'TAGS'
            ];

            const env_vars = _.map(app.env_vars, (v, k) => {
                return `${chalk.gray(k)}: ${v}`;
            });

            const volumes = _.map(app.volumes, (vol) => {
                let def = `${vol.host ? vol.host : chalk.gray('%CS_MANAGED%')}:${vol.container}`;

                if(vol.propogation) {
                    def = `${def}:${vol.propogation}`;
                }

                return def;
            });

            const tags = _.map(flatten(app.tags), (v, k) => {
                return `${chalk.gray(k)}: ${v}`;
            });

            const data = [
                app.image,
                app.discovery_port,
                app.command,
                app.engine,
                app.network_mode,
                app.container_port,
                app.cpus,
                app.memory,
                app.respawn,
                app.privileged,
                env_vars.join('\n'),
                volumes.join('\n'),
                tags.join('\n')
            ];

            const output = Table.createVerticalTable(headers, [data]);
            return logger.info(output);
        });
    }
});

module.exports.commands.push({
    name: 'create <app_name>',
    description: 'Create application.',
    options: application_options,
    callback: (argv) => {
        let options = _.omit(argv, ['h', 'help', '$0', '_']);
        options = parse_update_body(options);

        return request.post(`applications/${argv.app_name}`, {}, options, (err, response) => {
            if(err) {
                return logger.error(`Could not create application ${argv.app_name}!`);
            }

            if(response.statusCode !== 200) {
                return logger.error(response.body.error);
            }

            return logger.info(`Successfully created application ${argv.app_name}!`);
        });
    }
});

module.exports.commands.push({
    name: 'edit <app_name>',
    description: 'Edit application.',
    options: application_options,
    callback: (argv) => {
        let options = _.omit(argv, ['h', 'help', '$0', '_']);
        options = parse_update_body(options);

        return request.get(`applications/${argv.app_name}`, {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch application!');
            }

            if(response.statusCode === 404) {
                return logger.error(`Application ${argv.app_name} was not found!`);
            }

            const app = response.body;

            // environment variables
            app.env_vars = flatten(app.env_vars);
            const to_remove_env = _.keys(flatten(_.pickBy(options.env_vars, val => val !== false && !val)));
            to_remove_env.forEach((key) => {
                delete app.env_vars[key];
            });
            const to_add_env = flatten(_.pickBy(options.env_vars, val => val));
            options.env_vars = unflatten(_.merge(app.env_vars, to_add_env));

            // tags
            app.tags = flatten(app.tags);
            const to_remove_tag = _.keys(flatten(_.pickBy(options.tags, val => val !== false && !val)));
            to_remove_tag.forEach((key) => {
                delete app.tags[key];
            });
            const to_add_tag = flatten(_.pickBy(options.tags, val => val));
            options.tags = unflatten(_.merge(app.tags, to_add_tag));

            // volumes
            _.forEach(options.volumes, (vol) => {
                const existing = _.find(app.volumes, { container: vol.container });

                if(existing) {
                    existing.host = vol.host;
                    existing.container = vol.container;
                    existing.propogation = vol.propogation;
                } else {
                    app.volumes.push(vol);
                }
            });
            options.volumes = app.volumes;

            return request.put(`applications/${argv.app_name}`, {}, options, (err, response) => {
                if(err) {
                    return logger.error(`Could not update application ${argv.app_name}!`);
                }

                if(response.statusCode !== 200) {
                    return logger.error(response.body.error);
                }

                return logger.info(`Successfully updated application ${argv.app_name}!`);
            });
        });

    }
});

module.exports.commands.push({
    name: 'delete <app_name>',
    description: 'Delete application.',
    callback: (argv) => {
        return request.delete(`applications/${argv.app_name}`, {}, (err, response) => {
            if(err) {
                return logger.error(`Could not delete application ${argv.app_name}!`);
            }

            if(response.statusCode === 404) {
                return logger.error(`Application ${argv.app_name} does not exist!`);
            }

            if(response.statusCode !== 204) {
                return logger.error(`Could not delete application ${argv.app_name}!`);
            }

            return logger.info(`Successfully deleted application ${argv.app_name}!`);
        });
    }
});

module.exports.commands.push({
    name: 'scale-up <app_name>',
    description: 'Scale up application containers.',
    options: {
        count: {
            description: 'Number of containers to scale application up by.',
            alias: 'c',
            default: 1
        }
    },
    callback: (argv) => {
        return request.post(`applications/${argv.app_name}/containers`, { count: argv.count }, null, (err, response) => {
            if(err) {
                return logger.error(`Could not scale up application ${argv.app_name}!`);
            }

            if(response.statusCode === 404) {
                return logger.error(`Application ${argv.app_name} does not exist!`);
            }

            if(response.statusCode !== 201) {
                return logger.error(response.body.error);
            }

            return logger.info(`Successfully scaled up application ${argv.app_name}!`);
        });
    }
});

module.exports.commands.push({
    name: 'scale-down <app_name>',
    description: 'Scale down application containers.',
    options: {
        count: {
            description: 'Number of containers to scale application down by.',
            alias: 'c',
            default: 1
        }
    },
    callback: (argv) => {
        return request.delete(`applications/${argv.app_name}/containers`, { count: argv.count }, (err, response) => {
            if(err) {
                return logger.error(`Could not scale down application ${argv.app_name}!`);
            }

            if(response.statusCode === 404) {
                return logger.error(`Application ${argv.app_name} does not exist!`);
            }

            if(response.statusCode !== 204) {
                return logger.error(response.body.error);
            }

            return logger.info(`Successfully scaled down application ${argv.app_name}!`);
        });
    }
});

function parse_update_body(options) {
    if(_.has(options, 'tag')) {
        options.tags = utils.parse_key_value_args(options.tag);
        delete options.tag;
        delete options.t;
    }

    if(_.has(options, 'volume')) {
        options.volumes = utils.parse_volumes(options.volume);
        delete options.volume;
        delete options.b;
    }

    if(_.has(options, 'env-var')) {
        options.env_vars = utils.parse_key_value_args(options['env-var']);
        delete options['env-var'];
        delete options.e;
    }

    if(_.has(options, 'network-mode')) {
        options.network_mode = options['network-mode'];
        delete options['network-mode'];
    }

    if(_.has(options, 'container-port')) {
        options.container_port = options['container-port'];
        delete options['container-port'];
    }

    return options;
}
