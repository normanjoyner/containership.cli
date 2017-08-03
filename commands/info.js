'use strict';

const logger = require('../lib/logger');
const request = require('../lib/request');
const Table = require('../lib/table');

const _ = require('lodash');

module.exports = {
    name: 'info',
    description: 'Show info about current active cluster.',
    callback: () => {
        return request.get('cluster/state', {}, (err, response) => {
            if(err) {
                return logger.error(err);
            }

            const cluster = response.body;

            const host_names = _.keys(cluster.hosts).join('\n');
            const hosts = _.map(cluster.hosts, host => host);
            const app_names = _.keys(cluster.applications).join('\n');
            const containers = _.flatten(_.map(cluster.applications, (app) => {
                return app.containers;
            }));
            const loaded = _.reduce(containers, (acc, container) => {
                return acc + (container.status === 'loaded' ? 1 : 0);
            }, 0);

            const total_resources = _.reduce(hosts, (acc, host) => {
                if(host.mode === 'follower') {
                    acc.cpus += host.cpus;
                    acc.memory += host.memory;
                }

                return acc;
            }, { cpus: 0, memory: 0 });

            const used_resources = _.reduce(containers, (acc, container) => {
                if(container.status === 'loaded') {
                    acc.cpus += container.cpus;
                    acc.memory += container.memory;
                }

                return acc;
            }, { cpus: 0, memory: 0 });

            const headers = [
                'CPUS (USED / TOTAL)',
                'MEMORY (USED / TOTAL)',
                'APPLICATIONS',
                'CONTAINERS (LOADED / TOTAL)',
                'HOSTS'
            ];

            total_resources.memory = parseInt(total_resources.memory / 1024 / 1024);

            const data = [
                `${used_resources.cpus.toFixed(2)} / ${total_resources.cpus.toFixed(2)}`,
                `${used_resources.memory} MB / ${total_resources.memory} MB`,
                app_names,
                `${loaded} / ${containers.length}`,
                host_names
            ];

            const output = Table.createVerticalTable(headers, [data]);
            logger.info(output);
        });
    }
};
