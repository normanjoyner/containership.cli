var fs = require("fs");
var _ = require("lodash");
var config = require([__dirname, "config"].join("/")).config;

module.exports = {

    list: function(){
        try{
            return fs.readdirSync(config["plugin-location"]);
        }
        catch(e){
            process.stderr.write("Invalid plugin path provided!\n");
        }
    },

    load: function(plugin_name){
        try{
            var plugin_path = [config["plugin-location"], plugin_name].join("/");
            var plugin = require(plugin_path);
            if(plugin.type == "cli")
                return plugin;
        }
        catch(e){
            process.stderr.write(["Failed to load", plugin_name, "plugin\n"].join(" "));
        }
    }
}
