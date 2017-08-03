'use strict';

const _ = require('lodash');
const chalk = require('chalk');
const Table = require('cli-table2');

module.exports.createTable = function(headers, data, config) {
    headers = headers.map(header => chalk.bold.red(header));
    data = (headers && headers.length) ? [headers, ...data] : data;

    const t = new Table(config);
    t.push(...data);
    return t.toString();
};

module.exports.createVerticalTable = function(headers, data, config) {
    headers = headers.map(header => chalk.bold.red(header));

    const vertical_data = [];

    for (let x = 0; x < headers.length; x++) {
        const row = {};
        row[headers[x]] = _.map(data, row => row[x]);
        vertical_data.push(row);
    }

    const t = new Table(config);
    t.push(...vertical_data);
    return t.toString();
};
