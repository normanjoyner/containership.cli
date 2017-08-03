'use strict';

const logger = require('../lib/logger');
const request = require('../lib/request');
const Table = require('../lib/table');

const _ = require('lodash');
const through2 = require('through2');

module.exports = {
    name: 'container',
    description: 'List and manipulate containers running on the configured containership cluster.',
    commands: []
};

module.exports.commands.push({
    name: 'list',
    description: 'List containers on the configured cluster.',
    options: {
        app: {
            description: 'Name of the application running containers.',
            type: 'array',
            alias: ['a', 'application'],
            default: []
        },
        host: {
            description: 'Name of the host running containers.',
            type: 'array',
            alias: 'h',
            default: []
        }
    },
    callback: (argv) => {
        return request.get('applications', {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch containers!');
            }

            const app_names = argv.app;
            logger.info(app_names);

            if(app_names.length) {
                let oneExists = false;

                const tmp = {};

                _.forEach(app_names, (app_name) => {
                    if(!response.body[app_name]) {
                        return;
                    }

                    oneExists = true;
                    tmp[app_name] = response.body[app_name];
                });

                if(!oneExists) {
                    return logger.error(`None of the '${app_names.toString()}' applications exist on the cluster, could not retrieve containers!`);
                }

                response.body = tmp;
            }

            const headers = [
                'CONTAINER_ID',
                'APPLICATION',
                'HOST',
                'START_TIME',
                'STATUS'
            ];

            const data = _.chain(response.body)
                .map((app, name) => {
                    return app.containers
                        .filter(container => argv.host.length === 0 || argv.host.indexOf(container.host) !== -1)
                        .map((container) => {
                            return [
                                container.id,
                                name,
                                container.host,
                                new Date(container.start_time).toString(),
                                container.status
                            ];
                        });
                })
                .flatten()
                .value();

            if(data.length === 0) {
                return logger.error('No containers exist on the cluster given your host and application filters.');
            }

            const output = Table.createTable(headers, data);
            return logger.info(output);
        });
    }
});

module.exports.commands.push({
    name: 'show <container_id>',
    description: 'Show requested container information.',
    callback: (argv) => {
        return request.get('applications', {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch containers!');
            }

            const headers = [
                'CONTAINER_ID',
                'APPLICATION',
                'HOST',
                'START_TIME',
                'STATUS',
                'CPUS',
                'MEMORY',
                'CONTAINER_PORT',
                'RESPAWN',
                'HOST_ID',
                'HOST_PORT'
            ];

            const containers = _.chain(response.body)
                .map(app => {
                    return _.map(app.containers, (container) => {
                        container.application_name = app.id;
                        return container;
                    });
                })
                .flatten()
                .value();

            const container = _.find(containers, { id: argv.container_id });

            if(!container) {
                let err_msg = `Could not find container with id ${argv.container_id}`;

                return logger.error(`${err_msg}!`);
            }

            const data = [
                container.id,
                container.application_name,
                container.host,
                new Date(container.start_time).toString(),
                container.status,
                container.cpus,
                container.memory,
                container.container_port,
                container.respawn,
                container.host,
                container.host_port
            ];

            const output = Table.createVerticalTable(headers, [data]);
            logger.info(output);
        });
    }
});

function pipeLogs(app_name, container_id, type, out) {
    let ping_active = false;

    return request.get(`logs/applications/${app_name}/containers/${container_id}?type=${type}`)
        .pipe(through2(function(chunk, enc, cb) {
            chunk = chunk.toString();

            chunk.split('\n').forEach(line => {
                if(line === 'event: ping') {
                    ping_active = true;
                }

                if(line.startsWith('data: ')) {
                    if(ping_active) {
                        ping_active = false;
                        return;
                    }

                    line = line.replace('data: ', '').trim();

                    if(line.length) {
                        this.push(`${line}\n`);
                    }
                }
            });

            return cb();
        }))
        .pipe(out);
}

module.exports.commands.push({
    name: 'logs <container_id>',
    description: 'Stream logs for requested container.',
    options: {
        type: {
            alias: 't',
            choices: [
                'all',
                'stdout',
                'stderr'
            ],
            default: 'all',
            description: 'Type of logs to stream: stdout, stderr, or all'
        }
    },
    callback: (argv) => {
        return request.get('applications', {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch containers!');
            }

            let app_name = null;

            _.forEach(response.body, (app, name) => {
                if(_.find(app.containers, { id: argv.container_id })) {
                    app_name = name;
                    return false;
                }
            });

            if(!app_name) {
                return logger.error(`Could not find container ${argv.container_id} to stream logs from`);
            }

            if(argv.type === 'stdout' || argv.type === 'all') {
                pipeLogs(app_name, argv.container_id, 'stdout', process.stdout);
            }

            if(argv.type === 'stderr' || argv.type === 'all') {
                pipeLogs(app_name, argv.container_id, 'stderr', process.stderr);
            }
        });
    }
});

module.exports.commands.push({
    name: 'remove <container_id>',
    description: 'Remove container.',
    callback: (argv) => {
        return request.get('applications', {}, (err, response) => {
            if(err) {
                return logger.error('Could not fetch containers!');
            }

            let app_name = null;

            _.forEach(response.body, (app, name) => {
                if(_.find(app.containers, { id: argv.container_id })) {
                    app_name = name;
                    return false;
                }
            });

            if(!app_name) {
                return logger.error(`Could not find container ${argv.container_id} to remove!`);
            }

            return request.delete(`applications/${app_name}/containers/${argv.container_id}`, {}, (err, response) => {
                if(err) {
                    return logger.error('Could not fetch containers!');
                }

                if(!response.statusCode === 204) {
                    return logger.error(`Failed to remove container ${argv.container_id} from application ${app_name}!`);
                }

                return logger.info(`Successfully removed container ${argv.container_id} from application ${app_name}!`);
            });
        });
    }
});
