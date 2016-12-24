'use strict';

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
            type: 'string',
            alias: 'a'
        },
        host: {
            description: 'Name of the host running containers.',
            type: 'string',
            alias: 'h'
        }
    },
    callback: (argv) => {
        return request.get('applications', {}, (err, response) => {
            if(err) {
                return console.error('Could not fetch containers!');
            }

            const app_name = argv.app;

            if (app_name) {
                if (!response.body[app_name]) {
                    return console.error(`'${app_name}' application does not exist on the cluster, could not retrieve containers!`);
                }

                const tmp = response.body[app_name];
                response.body = {};
                response.body[app_name] = tmp;
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
                        .filter(container => argv.host === undefined || argv.host === container.host)
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

            if (data.length === 0) {
                let err_msg = `No containers exist on the cluster`;

                if (argv.app) {
                    err_msg = `${err_msg} for application ${argv.app}`;

                    if (argv.host) {
                        err_msg = `${err_msg} and`;
                    }
                }

                if (argv.host) {
                    err_msg = `${err_msg} for host ${argv.host}`;
                }

                return console.error(err_msg);
            }

            const output = Table.createTable(headers, data);
            return console.info(output);
        });
    }
});

module.exports.commands.push({
    name: 'show <container_id>',
    description: 'Show requested container information.',
    callback: (argv) => {
        return request.get('applications', {}, (err, response) => {
            if(err) {
                return console.error('Could not fetch containers!');
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
                    .map(app => app.containers)
                    .flatten()
                    .value();

            const container = _.find(containers, { id: argv.container_id });

            if (!container) {
                let err_msg = `Could not find container with id ${argv.container_id}`;

                return console.error(`${err_msg}!`);
            }

            const data = [
                container.id,
                container.env_vars.CS_APPLICATION,
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
            console.info(output);
        });
    }
});

function pipeLogs(app_name, container_id, type, out) {
    let pingActive = false;

    return request.get(`logs/applications/${app_name}/containers/${container_id}?type=${type}`)
        .pipe(through2(function(chunk, enc, cb) {
            chunk = chunk.toString();

            chunk.split('\n').forEach(line => {
                if (line === 'event: ping') {
                    pingActive = true;
                }

                if (line.startsWith('data: ')) {
                    if (pingActive) {
                        pingActive = false;
                        return;
                    }

                    line = line.replace('data: ', '').trim();

                    if (line.length) {
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
                return console.error('Could not fetch containers!');
            }

            let app_name = null;

            _.forEach(response.body, (app, name) => {
                if (_.find(app.containers, { id: argv.container_id })) {
                    app_name = name;
                    return false;
                }
            });

            if (!app_name) {
                return console.error(`Could not find container ${argv.container_id} to stream logs from`);
            }

            if (argv.type === 'stdout' || argv.type === 'all') {
                pipeLogs(app_name, argv.container_id, 'stdout', process.stdout);
            }

            if (argv.type === 'stderr' || argv.type === 'all') {
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
                return console.error('Could not fetch containers!');
            }

            let app_name = null;

            _.forEach(response.body, (app, name) => {
                if (_.find(app.containers, { id: argv.container_id })) {
                    app_name = name;
                    return false;
                }
            });

            if (!app_name) {
                return console.error(`Could not find container ${argv.container_id} to remove!`);
            }

            return request.delete(`applications/${app_name}/containers/${argv.container_id}`, {}, (err, response) => {
                if(err) {
                    return console.error('Could not fetch containers!');
                }

                if (!response.statusCode === 204) {
                    return console.error(`Failed removed container ${argv.container_id} from application ${app_name}!`);
                }

                return console.info(`Successfully removed container ${argv.container_id} from application ${app_name}!`);
            });
        });
    }
});
