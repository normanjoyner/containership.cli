'use strict';

const _ = require('lodash');

module.exports = {
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

    parse_env_vars: (core) => {
        const argv = process.argv;

        _.forEach(process.env, (value, name) => {
            if(name.indexOf('CS_') === 0) {
                name = name.substring(3, name.length).replace(/_/g, '-').toLowerCase();
                const flag = `--${name}`;

                if(!_.contains(process.argv, flag)) {
                    if(_.has(core.options, name)) {
                        if(core.options[name].list) {
                            value = value.split(',');
                        } else {
                            value = [value];
                        }

                        _.forEach(value, (v) => {
                            argv.push(flag);
                            argv.push(v);
                        });
                    } else if(_.has(core.scheduler.options, name)) {
                        if(core.scheduler.options[name].list) {
                            value = value.split(',');
                        } else {
                            value = [value];
                        }

                        _.forEach(value, (v) => {
                            argv.push(flag);
                            argv.push(v);
                        });
                    } else if(_.has(core.api.options, name)) {
                        if(core.api.options[name].list) {
                            value = value.split(',');
                        } else {
                            value = [value];
                        }

                        _.forEach(value, (v) => {
                            argv.push(flag);
                            argv.push(v);
                        });
                    }
                }
            }
        });

        return argv.slice(2);
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

    parse_tags: (tags) => {
        tags = _.reduce(tags, (accumulator, tag) => {
            const idx = tag.indexOf('=');

            accumulator[tag.substring(0, idx)] = tag.substring(idx + 1);
            return accumulator;
        }, {});

        return tags;
    }
};
