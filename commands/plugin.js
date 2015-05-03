var fs = require("fs");
var child_process = require("child_process");
var _ = require("lodash");
var npm = require("npm");
var request = require("request");
var flat = require("flat");

module.exports = {

    init: function(options){
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

            npm.load({prefix: plugins_dir}, function(){
                if(options.subcommand == "list"){
                    npm.commands.ls([], {json: true}, function(err, data){
                        try{
                            _.each(data.dependencies, function(plugin, name){
                                if(name.indexOf("containership.plugin.") == 0)
                                    name = name.substring(21, name.length);

                                console.log([name, plugin.version].join("@"));
                            });
                        }
                        catch(e){
                            console.log("No plugins installed!");
                        }
                    });
                }
                else if(options.subcommand == "search"){
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

                    _.each(plugins, function(name){
                        console.log([name, authorized_plugins[name].description].join(" - "));
                    });
                }
                else if(!_.has(options, "plugin")){
                    process.stderr.write("plugin name required!");
                    process.exit(1);
                }
                else if(options.subcommand == "configure"){
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
                else if(options.subcommand == "add"){
                    if(_.has(authorized_plugins, options.plugin))
                        options.plugin = authorized_plugins[options.plugin].source;

                    console.log(["Installing plugin:", options.plugin].join(" "));
                    npm.commands.install([options.plugin], function(err, data){});
                }
                else if(options.subcommand == "remove"){
                    if(_.has(authorized_plugins, options.plugin))
                        options.plugin = authorized_plugins[options.plugin].source;

                    if(options.plugin.lastIndexOf("/") != -1){
                        options.plugin = options.plugin.substring(options.plugin.lastIndexOf("/") + 1, options.plugin.length);
                        if(options.plugin.indexOf(".git") != -1)
                            options.plugin = options.plugin.substring(0, options.plugin.indexOf(".git"));
                    }

                    console.log(["Uninstalling plugin:", options.plugin].join(" "));
                    npm.commands.uninstall([options.plugin], function(err, data){});
                }
                else{
                    if(_.has(authorized_plugins, options.plugin))
                        options.plugin = authorized_plugins[options.plugin].source;

                    console.log(["Updating plugin:", options.plugin].join(" "));
                    npm.commands.update([options.plugin], function(err, data){});
                }
            });
        });
    },

    options: {
        subcommand: {
            help: "Plugin subcommand [add, remove, update, list, search, configure]",
            position: 1,
            required: true,
            choices: ["add", "remove", "update", "list", "search", "configure"]
        },
        plugin: {
            help: "Name of the plugin to install. Can be authorized plugin, github repository or npm package",
            position: 2
        }
    }
}
