'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');

const CONFIG_PATH = `${process.env.HOME}/.containership`;
const CLI_CONFIG_FILE = `${CONFIG_PATH}/cli-v2.json`;

module.exports.get = function() {
    return require(CLI_CONFIG_FILE);
};

module.exports.set = function(config) {
    return fs.writeFileSync(CLI_CONFIG_FILE, JSON.stringify(config, null, '\t'));
};

module.exports.getActiveCluster = function() {
    const conf = module.exports.get();
    const active = conf.metadata['active_remote'];

    return conf.remotes[active];
};

module.exports.initialize = function() {
    if(!fs.existsSync(CONFIG_PATH)) {
        mkdirp.sync(CONFIG_PATH);
    }

    if(!fs.existsSync(CLI_CONFIG_FILE)) {
        fs.writeFileSync(CLI_CONFIG_FILE, JSON.stringify({
            'metadata': {
                'active_remote': null
            },
            'remotes': {},
            'plugins': {}
        }, null, '\t'));
    }
};
