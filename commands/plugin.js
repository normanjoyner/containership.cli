var fs = require("fs");
var child_process = require("child_process");
var _ = require("lodash");
var npm = require("npm");
var request = require("request");
var flat = require("flat");
var sprintf = require("sprintf-js").sprintf;
var nomnom = require("nomnom")();

module.exports = {

    nomnom: function(){
        _.each(module.exports.commands, function(command, command_name){
            nomnom.command(command_name).options(command.options).callback(command.callback)
        });

        return nomnom;
    },

    commands: {
        list: {
            options: {},

            callback: function(options){
                var plugins_dir = [process.env["HOME"], ".containership", "plugins"].join("/");

                npm.load({
                    prefix: plugins_dir,
                    "unsafe-perm": true
                }, function(){
                    npm.commands.ls([], { json: true }, function(err, data){
                        console.log(sprintf("%-40s %-20s", "PLUGIN", "VERSION"));
                        try{
                            _.each(data.dependencies, function(plugin, name){
                                if(name.indexOf("containership.plugin.") == 0)
                                    name = name.substring(21, name.length);

                                console.log(sprintf("%-40s %-20s", name, plugin.version));
                            });
                        }
                        catch(e){
                            console.log("No plugins installed!");
                        }
                    });
                });
            }
        },

        search: {
            options: {
                plugin: {
                    position: 1,
                    help: "Name of the plugin to configure",
                    metavar: "PLUGIN"
                }
            },

            callback: function(options){
                var plugins_dir = [process.env["HOME"], ".containership", "plugins"].join("/");

                request({ url: "http://plugins.containership.io", json: true }, function(err, response){
                    if(err || response.statusCode != 200)
                        authorized_plugins = {};
                    else
                        authorized_plugins = response.body;

                    try{
                        fs.mkdirSync(plugins_dir);
                    }
                    catch(e){}

                    npm.load({
                        prefix: plugins_dir,
                        "unsafe-perm": true
                    }, function(){
                        if(_.has(options, "plugin")){
                            var plugins = [];
                            var regex = new RegExp(options.plugin, "g");
                            _.each(_.keys(authorized_plugins), function(name){
                                if(regex.test(name))
                                    plugins.push(name);
                            });
                        }
                        else
                            var plugins = _.keys(authorized_plugins);

                        console.log(sprintf("%-40s %-100s", "PLUGIN", "DESCRIPTION"));
                        _.each(_.sortBy(plugins), function(name){
                            console.log(sprintf("%-40s %-100s", name, authorized_plugins[name].description));
                        });
                    });
                });
            }
        },

        configure: {
            options: {
                plugin: {
                    position: 1,
                    help: "Name of the plugin to configure",
                    metavar: "PLUGIN",
                    required: true
                }
            },

            callback: function(options){
                var plugins_dir = [process.env["HOME"], ".containership", "plugins"].join("/");

                var name = options.plugin;

                if(name.indexOf("containership.plugin.") == 0)
                    name = name.substring(21, name.length);

                var config = _.omit(options, ["_", "0", "plugin", "subcommand"]);

                fs.writeFile([process.env["HOME"], ".containership", [name, "json"].join(".")].join("/"), JSON.stringify(flat.unflatten(config), null, 2), function(err){
                    if(err){
                        process.stderr.write(err.message);
                        process.exit(1);
                    }
                    else
                        console.log(["Wrote", name, "configuration file!"].join(" "));
                });
            }
        },

        add: {
            options: {
                plugin: {
                    position: 1,
                    help: "Name of the plugin to add",
                    metavar: "PLUGIN",
                    required: true
                }
            },

            callback: function(options){
                var plugins_dir = [process.env["HOME"], ".containership", "plugins"].join("/");

                npm.load({
                    prefix: plugins_dir,
                    "unsafe-perm": true
                }, function(){
                    if(_.has(authorized_plugins, options.plugin))
                        options.plugin = authorized_plugins[options.plugin].source;

                    console.log(["Installing plugin:", options.plugin].join(" "));
                    npm.commands.install([options.plugin], function(err, data){});
                });
            }
        },

        remove: {
            options: {
                plugin: {
                    position: 1,
                    help: "Name of the plugin to remove",
                    metavar: "PLUGIN",
                    required: true
                }
            },

            callback: function(options){
                var plugins_dir = [process.env["HOME"], ".containership", "plugins"].join("/");

                npm.load({
                    prefix: plugins_dir,
                    "unsafe-perm": true
                }, function(){
                    if(_.has(authorized_plugins, options.plugin))
                        options.plugin = authorized_plugins[options.plugin].source;

                    if(options.plugin.lastIndexOf("/") != -1){
                        options.plugin = options.plugin.substring(options.plugin.lastIndexOf("/") + 1, options.plugin.length);
                        if(options.plugin.indexOf(".git") != -1)
                            options.plugin = options.plugin.substring(0, options.plugin.indexOf(".git"));
                    }

                    console.log(["Uninstalling plugin:", options.plugin].join(" "));
                    npm.commands.uninstall([options.plugin], function(err, data){});
                });
            }
        },

        update: {
            options: {
                plugin: {
                    position: 1,
                    help: "Name of the plugin to remove",
                    metavar: "PLUGIN",
                    required: true
                }
            },

            callback: function(options){
                var plugins_dir = [process.env["HOME"], ".containership", "plugins"].join("/");

                npm.load({
                    prefix: plugins_dir,
                    "unsafe-perm": true
                }, function(){
                    if(_.has(authorized_plugins, options.plugin))
                        options.plugin = authorized_plugins[options.plugin].source;

                    console.log(["Updating plugin:", options.plugin].join(" "));
                    npm.commands.update([options.plugin], function(err, data){});
                });
            }
        }
    }

}
