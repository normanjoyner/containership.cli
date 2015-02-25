var _ = require("lodash");

module.exports = {
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
