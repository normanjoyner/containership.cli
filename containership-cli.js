var fs = require("fs");
var _ = require("lodash");
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

    var commands = require([__dirname, "commands"].join("/"));

    _.each(commands, function(command, command_name){
        _.defaults(this.configure_options, command.configure_options || {});
        if(_.has(command, "nomnom")){
            this.commands[command_name] = {
                nomnom: command.nomnom()
            }
        }
        else
            this.commands[command_name] = command;
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

ContainershipCLI.prototype.set_middleware = function(middleware){
    if(_.isUndefined(config.config.middleware))
        config.config.middleware = middleware;
    else
        config.config.middleware = _.flatten([config.config.middleware, middleware]);
}

module.exports = ContainershipCLI;
