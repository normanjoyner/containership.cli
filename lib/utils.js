'use strict';

const _ = require('lodash');
const prompt = require('prompt');

module.exports = {
    yesno: (options, cb) => {
        if(typeof options === 'function') {
            cb = options;
            options = {};
        }

        prompt.message = options.message || 'Do you want to continue?';
        prompt.start();

        prompt.get({
            properties: {
                yes: {
                    pattern: /^y$|^yes$|^n$|^no$/i,
                    description: options.prompt || '[yes/no]',
                    required: true
                }
            }
        }, (err, result) => {
            if(err) {
                return cb(err);
            }

            return cb(null, /^y$|^yes$/i.test(result.yes));
        });
    },

    split_on_line_length: (str, max_char_per_line, separator) => {
        separator = separator || '\n';

        const lines = [];

        while (str.length > max_char_per_line) {
            lines.push(str.substring(0, max_char_per_line));
            str = str.substring(max_char_per_line);
        }

        lines.push(str);

        return lines.join(separator);
    },

    parse_volumes: (volumes) => {
        return _.map(volumes, (volume) => {
            const parts = volume.split(':');

            volume = {
                container: 1 === parts.length ? parts[0] : parts[1]
            };

            if(1 < parts.length) {
                if(!_.isEmpty(parts[0])) {
                    volume.host = parts[0];
                }

                // ex: /host/path:/container/path:{propogationType}
                if(3 === parts.length) {
                    volume.propogation = parts[2];
                }
            }

            return volume;
        });
    },

    parse_key_value_args: (kv) => {
        kv = _.reduce(kv, (accumulator, kv) => {
            const idx = kv.indexOf('=');

            if(idx !== -1) {
                accumulator[kv.substring(0, idx)] = kv.substring(idx + 1);
            }

            return accumulator;
        }, {});

        return kv;
    }
};
