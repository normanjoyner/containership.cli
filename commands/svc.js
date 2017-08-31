'use strict';

const logger = require('../lib/logger');
const request = require('../lib/request');
const Table = require('../lib/table');
const utils = require('../lib/utils');

const _ = require('lodash');
const async = require('async');
const chalk = require('chalk');
const Converter = require('@containership/containership.schema-converter');
const flatten = require('flat');
const unflatten = flatten.unflatten;

const service_options = {
    engine: {
        description: 'Engine used to start service',
        alias: 'x'
    },
    image: {
        description: 'Service image',
        alias: 'i'
    },
    'env-var': {
        array: true,
        description: 'Environment variable for service',
        alias: 'e'
    },
    'network-mode': {
        description: 'Service network mode',
        alias: 'n'
    },
    'container-port': {
        description: 'Port service must listen on',
        alias: 'p'
    },
    command: {
        description: 'Service start command',
        alias: 's'
    },
    volume: {
        description: 'Volume to bind-mount for service',
        array: true,
        alias: 'b'
    },
    tag: {
        description: 'Tag to add to service',
        array: true,
        alias: 't'
    },
    cpus: {
        description: 'CPUs allocated to service',
        alias: 'c'
    },
    memory: {
        description: 'Memory (mb) allocated to service',
        alias: 'm'
    },
    privileged: {
        description: 'Run service containers in privileged mode',
        boolean: true
    },
    respawn: {
        description: 'Respawn service containers when they die',
        boolean: true,
        default: true
    }
};

module.exports = {
    name: 'svc',
    description: 'List and manipulate services running on the cluster specified by the client remote.',
    commands: []
};

module.exports.commands.push({
    name: 'list',
    description: 'List services on the cluster.',
    callback: () => {
        return request.get('applications', {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch services!');
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
                const service = response.body[key];

                const loaded_containers = service.containers.reduce((accumulator, container) => {
                    if(container.status === 'loaded') {
                        accumulator++;
                    }

                    return accumulator;
                }, 0);

                return [
                    service.id,
                    service.image,
                    service.command,
                    service.cpus,
                    service.memory,
                    `${loaded_containers || 0}/${service.containers.length}`
                ];
            });

            if(data.length === 0) {
                return logger.error('You currently have no services configured on the cluster!');
            }

            const output = Table.createTable(headers, data);
            return logger.info(output);
        });
    }
});

module.exports.commands.push({
    name: 'show <service_name>',
    description: 'Show detailed information for specified service.',
    callback: (argv) => {
        return request.get(`applications/${argv.service_name}`, {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch services!');
            }

            if(response.statusCode === 404) {
                return logger.error(`Application ${argv.service_name} was not found!`);
            }

            const service = response.body;

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

            const env_vars = _.map(service.env_vars, (v, k) => {
                return `${chalk.gray(k)}: ${v}`;
            });

            const volumes = _.map(service.volumes, (vol) => {
                let def = `${vol.host ? vol.host : chalk.gray('%CS_MANAGED%')}:${vol.container}`;

                if(vol.propogation) {
                    def = `${def}:${vol.propogation}`;
                }

                return def;
            });

            const tags = _.map(flatten(service.tags), (v, k) => {
                return `${chalk.gray(k)}: ${v}`;
            });

            const data = [
                service.image,
                service.discovery_port,
                service.command,
                service.engine,
                service.network_mode,
                service.container_port,
                service.cpus,
                service.memory,
                service.respawn,
                service.privileged,
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
    name: 'create-from-file',
    description: 'Create service from file.',
    options: {
        file: {
            array: true,
            required: true,
            description: 'One or more files with service configurations.',
            alias: 'f'
        },
        type: {
            required: true,
            description: 'Type of configuration. (docker, containership, kubernetes)',
            choices: ['docker', 'containership', 'kubernetes'],
            alias: 't'
        }
    },
    callback: (argv) => {
        const config = Converter.getConverter(argv.file, {
            configuration_service: argv.type.toLowerCase(),
            configuration_type: 'file'
        });


        return async.waterfall([
            (cb) => {
                let result;
                try {
                    result = config.convertTo(Converter.services.CONTAINERSHIP);
                } catch(conversionError) {
                    return cb(conversionError);
                }

                let foundError = false;

                // if there were any parsing errors, warn about them
                _.forEach(result.errors, (errorList, app) => {
                    if(errorList.length > 0) {
                        foundError = true;
                        logger.warn(`Service ${app} encountered the following errors during parsing:`);
                        logger.warn(`\t${errorList.join('\n\t')}`);
                    }
                });

                return cb(null, result, foundError);
            },
            (conversionResult, foundError, cb) => {
                if(!foundError) {
                    return setImmediate(() => {
                        return cb(null, conversionResult, true);
                    });
                }

                return utils.yesno({
                    message: 'The above errors were encounters while converting, do you still want to create the services?'
                }, (err, shouldCreate) => {
                    if(err) {
                        return cb(err);
                    }

                    return cb(null, conversionResult, shouldCreate);
                });
            },
            (result, shouldCreate, cb) => {
                if(!shouldCreate) {
                    return cb('Not creating services due to errors during conversion...');
                }

                return request.post('applications', {}, result.configuration, (err, response) => {
                    if(err) {
                        return cb(`Could not create service ${_.keys(result.configuration)}!`);
                    }

                    if(response.statusCode !== 201) {
                        return cb(response.body.error);
                    }

                    return cb(null, `Successfully created services ${_.keys(result.configuration)}!`);
                });
            }
        ], (err, res) => {
            if(err) {
                return logger.error(err);
            }

            logger.info(res);
        });
    }
});

module.exports.commands.push({
    name: 'create <service_name>',
    description: 'Create service.',
    options: service_options,
    callback: (argv) => {
        let options = _.omit(argv, ['h', 'help', '$0', '_']);
        options = parse_update_body(options);
        options.id = argv.service_name;

        return request.post(`applications/${argv.service_name}`, {}, options, (err, response) => {
            if(err) {
                return logger.error(`Could not create service ${argv.service_name}!`);
            }

            if(response.statusCode !== 200) {
                return logger.error(response.body.error);
            }

            return logger.info(`Successfully created service ${argv.service_name}!`);
        });
    }
});

module.exports.commands.push({
    name: 'edit <service_name>',
    description: 'Edit service.',
    options: service_options,
    callback: (argv) => {
        let options = _.omit(argv, ['h', 'help', '$0', '_']);
        options = parse_update_body(options);

        return request.get(`applications/${argv.service_name}`, {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch service!');
            }

            if(response.statusCode === 404) {
                return logger.error(`Application ${argv.service_name} was not found!`);
            }

            const service = response.body;

            // environment variables
            service.env_vars = flatten(service.env_vars);
            const to_remove_env = _.keys(flatten(_.pickBy(options.env_vars, val => val !== false && !val)));
            to_remove_env.forEach((key) => {
                delete service.env_vars[key];
            });
            const to_add_env = flatten(_.pickBy(options.env_vars, val => val));
            options.env_vars = unflatten(_.merge(service.env_vars, to_add_env));

            // tags
            service.tags = flatten(service.tags);
            const to_remove_tag = _.keys(flatten(_.pickBy(options.tags, val => val !== false && !val)));
            to_remove_tag.forEach((key) => {
                delete service.tags[key];
            });
            const to_add_tag = flatten(_.pickBy(options.tags, val => val));
            options.tags = unflatten(_.merge(service.tags, to_add_tag));

            // volumes
            _.forEach(options.volumes, (vol) => {
                const existing = _.find(service.volumes, { container: vol.container });

                if(existing) {
                    existing.host = vol.host;
                    existing.container = vol.container;
                    existing.propogation = vol.propogation;
                } else {
                    service.volumes.push(vol);
                }
            });
            options.volumes = service.volumes;

            return request.put(`applications/${argv.service_name}`, {}, options, (err, response) => {
                if(err) {
                    return logger.error(`Could not update service ${argv.service_name}!`);
                }

                if(response.statusCode !== 200) {
                    return logger.error(response.body.error);
                }

                return logger.info(`Successfully updated service ${argv.service_name}!`);
            });
        });

    }
});

module.exports.commands.push({
    name: 'delete <service_name>',
    description: 'Delete service.',
    callback: (argv) => {
        return request.delete(`applications/${argv.service_name}`, {}, (err, response) => {
            if(err) {
                return logger.error(`Could not delete service ${argv.service_name}!`);
            }

            if(response.statusCode === 404) {
                return logger.error(`Application ${argv.service_name} does not exist!`);
            }

            if(response.statusCode !== 204) {
                return logger.error(`Could not delete service ${argv.service_name}!`);
            }

            return logger.info(`Successfully deleted service ${argv.service_name}!`);
        });
    }
});

module.exports.commands.push({
    name: 'scale-up <service_name>',
    description: 'Scale up service containers.',
    options: {
        count: {
            description: 'Number of containers to scale service up by.',
            alias: 'c',
            default: 1
        }
    },
    callback: (argv) => {
        return request.post(`applications/${argv.service_name}/containers`, { count: argv.count }, null, (err, response) => {
            if(err) {
                return logger.error(`Could not scale up service ${argv.service_name}!`);
            }

            if(response.statusCode === 404) {
                return logger.error(`Application ${argv.service_name} does not exist!`);
            }

            if(response.statusCode !== 201) {
                return logger.error(response.body.error);
            }

            return logger.info(`Successfully scaled up service ${argv.service_name}!`);
        });
    }
});

module.exports.commands.push({
    name: 'scale-down <service_name>',
    description: 'Scale down service containers.',
    options: {
        count: {
            description: 'Number of containers to scale service down by.',
            alias: 'c',
            default: 1
        }
    },
    callback: (argv) => {
        return request.delete(`applications/${argv.service_name}/containers`, { count: argv.count }, (err, response) => {
            if(err) {
                return logger.error(`Could not scale down service ${argv.service_name}!`);
            }

            if(response.statusCode === 404) {
                return logger.error(`Application ${argv.service_name} does not exist!`);
            }

            if(response.statusCode !== 204) {
                return logger.error(response.body.error);
            }

            return logger.info(`Successfully scaled down service ${argv.service_name}!`);
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
