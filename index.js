'use strict';

const configuration = require('./lib/configuration');
const logger = require('./lib/logger');

const _ = require('lodash');
const fs = require('fs');
const yargs = require('yargs');

class ContainershipCli {
    constructor(options) {
        this.options = options || {};
        configuration.initialize();

        this.commands = _.chain(fs.readdirSync(`${__dirname}/commands`))
            .map(file => require(`${__dirname}/commands/${file}`))
            .sortBy(plugin => plugin.name)
            .value();

        const conf = configuration.get();

        this.plugin_commands = _.chain(conf.plugins)
            .map((plugin, name) => {
                let req;
                try {
                    req = require(plugin.path);
                } catch(e) {
                    logger.warn(`Plugin ${name} no longer exists in plugin directory...removing from config.`);
                    delete conf.plugins[name];
                    return;
                }

                return typeof req === 'function' ? new req().cli : req && req.cli;
            })
            .filter(plugin => plugin)
            .sort(plugin => plugin.name)
            .value();

        configuration.set(conf);
    }

    run() {
        if(yargs.argv._.length === 0) {
            return this.unknownCommand();
        }

        const cmd_name = yargs.argv._[0];

        let cmd = null;

        // eslint-disable-next-line no-cond-assign
        if(cmd = _.find(this.commands, { name: cmd_name })) {
            this.parseCommand(yargs, cmd);
            return yargs.help().argv;
        }

        // eslint-disable-next-line no-cond-assign
        if(cmd = _.find(this.plugin_commands, { name: cmd_name })) {
            this.parseCommand(yargs, cmd);
            return yargs.help().argv;
        }

        return this.unknownCommand();
    }

    unknownCommand() {
        this.commands.forEach(cmd => this.parseCommand(yargs, cmd));
        this.plugin_commands.forEach(cmd => this.parseCommand(yargs, cmd));

        logger.info(`${yargs.argv['$0']} ${yargs.argv._.join(' ')}`);
        return yargs.showHelp('log');
    }

    parseCommand(yargs, def) {
        // has sub-commands defined
        if(def.commands) {
            yargs.command({
                command: def.name,
                description: def.description,
                builder: (yargs) => {
                    let hasDefault = false;

                    _.forEach(def.commands, (cmd) => {
                        hasDefault = hasDefault || cmd === '*';
                        return this.parseCommand(yargs, cmd);
                    });

                    if(!hasDefault) {
                        yargs.command('*', '', {}, () => {
                            _.forEach(_.sortBy(def.commands, cmd => cmd.name), cmd => {
                                hasDefault = hasDefault || cmd === '*';
                                return this.parseCommand(yargs, cmd);
                            });

                            return yargs.showHelp('log');
                        });
                    }
                }
            });
        } else if(def.callback) {
            yargs.command(def.name, def.description, def.options || {}, def.callback);
        }
    }
}

module.exports = ContainershipCli;
