var fs = require("fs");
var _ = require("lodash");
var config = require([__dirname, "..", "lib", "config"].join("/"));
var sprintf = require("sprintf-js").sprintf;

module.exports = {

    init: function(options){
        options = _.omit(options, ["_", "0"]);
        if(_.isEmpty(options)){
            _.each(_.omit(config.config, "middleware"), function(value, key){
                console.log(sprintf("%-20s %-100s", key, JSON.stringify(value, null, 2)));
            });
        }
        else{
            options = _.pick(options, _.keys(this.specs));
            config.set(options);
            _.each(config.config, function(value, key){
                console.log(sprintf("%-20s %-100s", key, JSON.stringify(value, null, 2)));
            });
        }
    },

    options: {
        "api-url": {
            help: "address of the Containership API"
        },

        "api-version": {
            help: "version of the Containership API"
        },

        "plugin-location": {
            help: "location of CLI plugins"
        },

        "strict-ssl": {
            flag: true,
            help: "enforce strict ssl checking"
        }
    }

}
