'use strict';

const configuration = require('./configuration');
const logger = require('./logger');

const _ = require('lodash');
const request = require('request');

module.exports.get = function(path, qs, callback) {
    let options = requestOptions('GET', path, qs);

    return request(options, checkResponse(callback));
};

module.exports.post = function(path, qs, body, callback) {
    let options = requestOptions('POST', path, qs, body);

    return request(options, checkResponse(callback));
};

module.exports.put = function(path, qs, body, callback) {
    let options = requestOptions('PUT', path, qs, body);

    return request(options, checkResponse(callback));
};

module.exports.delete = function(path, qs, callback) {
    let options = requestOptions('DELETE', path, qs);

    return request(options, checkResponse(callback));
};

function checkResponse(callback) {
    return (err, response) => {
        if(_.get(response, 'body.message') === 'Not found.') {
            logger.error('Cluster configured by remote could not be reached.');
            process.exit(1);
        }

        return callback(err, response);
    };
}


function requestOptions(method, path, qs, body) {
    const conf = configuration.get();
    const remote_config = getAndCheckActiveCluster();

    let options = {
        url: `${remote_config['url']}/${remote_config['version']}/${path}`,
        headers: remote_config.headers || conf.metadata.request.headers || {},
        method: method,
        qs: qs || {},
        json: body || true,
        strictSSL: true
    };

    return options;
}

function getAndCheckActiveCluster() {
    const remote_config = configuration.getActiveCluster();

    if(!remote_config) {
        process.stderr.write('You currently have no active remote selected!');
        process.exit(1);
    }

    if(!remote_config['url']) {
        process.stderr.write('Active cluster must contain an `url`!');
        process.exit(1);
    }

    if(!remote_config['version']) {
        process.stderr.write('Active cluster must contain a `version`!');
        process.exit(1);
    }

    return remote_config;
}
