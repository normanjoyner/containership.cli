var _ = require("lodash");

module.exports = {

    parse_volumes: function(volumes){
        return _.map(volumes, function(volume){
            var parts = volume.split(":");

            volume = {
                container: parts[1]
            }

            if(!_.isEmpty(parts[0]))
                volume.host = parts[0];

            return volume;
        });
    },

    parse_tags: function(tags){
        tags = _.map(tags, function(tag){
            return tag.split("=");
        });

        return _.zipObject(tags);
    },

    stringify_tags: function(tags){
        var tags = _.map(tags, function(val, key){
            return [key, val].join("=");
        });

        if(!_.isEmpty(tags))
            return tags.join(", ");
        else
            return "-";
    }

}
