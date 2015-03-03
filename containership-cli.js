var _ = require("lodash");
var fs = require("fs");
var config = require([__dirname, "lib", "config"].join("/"));

// define ContainershipCLI
function ContainershipCLI(options){
    if(fs.existsSync([process.env.HOME, ".containership", "cli.json"].join("/")))
        config.load();
    else{
        config.set({
            "api-url": "http://localhost:8080",
            "api-version": "v1",
            "plugin-location": [process.env.HOME, ".containership", "plugins", "node_modules"].join("/")
        });
    }

    this.commands = {};
    this.configure_options = {};

    var available_commands = fs.readdirSync([__dirname, "commands"].join("/"));
    _.each(available_commands, function(command){
        var command_name = command.split(".")[0];
        this.commands[command_name] = require([__dirname, "commands", command].join("/"));
        _.defaults(this.configure_options, this.commands[command_name].configure_options || {});
    }, this);

    var plugins = require([__dirname, "lib", "plugins"].join("/"));
    var available_plugins = plugins.list();
    _.each(available_plugins, function(plugin_name){
        var plugin = plugins.load(plugin_name);
        if(!_.isUndefined(plugin)){
            plugin_name = plugin_name.replace("containership.plugin.", "");
            this.commands[plugin_name] = plugin.initialize();
            _.defaults(this.configure_options, this.commands[plugin_name].configure_options || {});
        }
    }, this);

    this.commands.configure.options = _.defaults(this.commands.configure.options, this.configure_options);
}

module.exports = ContainershipCLI;
