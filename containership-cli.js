var _ = require("lodash");
var fs = require("fs");
var config = require([__dirname, "lib", "config"].join("/"));

// define ContainershipCLI
function ContainershipCLI(options){
    if(fs.existsSync([process.env["HOME"], ".containership", "cli.json"].join("/")))
        config.load();
    else{
        config.set({
            "api-url": "http://localhost:8080",
            "api-version": "v1"
        });
    }

    this.commands = {};

    var available_commands = fs.readdirSync([__dirname, "commands"].join("/"));
    _.each(available_commands, function(command){
        var command_name = command.split(".")[0];
        this.commands[command_name] = require([__dirname, "commands", command].join("/"));
    }, this);
}

module.exports = ContainershipCLI;
