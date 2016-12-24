'use strict';

const request = require('../lib/request');

const fs = require('fs');

module.exports = {
    name: 'backup',
    description: 'backup and restore applications on a Containership cluster',
    commands: []
};

module.exports.commands.push({
    name: 'create',
    description: 'backup applications on a Containership cluster',
    options: {
        persistence: {
            description: 'Type of persistence to use [local]',
            alias: 'p',
            default: 'local',
            choices: ['local']
        },
        file: {
            description: 'Local file to write to',
            alias: 'f',
            default: `/tmp/containership.backup.${new Date().valueOf()}`
        }
    },
    callback: (argv) => {
        if(argv.persistence === 'local') {
            request.get('applications', {}, (err, response) => {
                if(err) {
                    return console.error(`Error writing file to ${argv.file}`);
                }

                return fs.writeFile(argv.file, JSON.stringify(response.body), (err) => {
                    if(err) {
                        return console.error(`Error writing file to ${argv.file}`);
                    }

                    return console.info(`Successfully wrote file to ${argv.file}\n`);
                });
            });
        }
    }
});

module.exports.commands.push({
    name: 'restore',
    description: 'restore applications from existing backup to a containership cluster',
    options: {
        persistence: {
            description: 'Type of persistence to use [local]',
            alias: 'p',
            default: 'local',
            choices: ['local']
        },
        file: {
            description: 'Local file to restore from',
            alias: 'f',
            required: true
        }
    },
    callback: (argv) => {
        if(argv.persistence === 'local') {
            fs.readFile(argv.file, (err, applications) => {
                if(err) {
                    return console.error(`Error reading file: ${argv.file}`);
                }

                return request.post('applications', {}, JSON.parse(applications), (err, response) => {
                    if(err || response.statusCode != 201) {
                        return console.error('Error restoring applications!');
                    }

                    return console.info('Successfully restored applications!\n');
                });
            });
        }
    }
});
