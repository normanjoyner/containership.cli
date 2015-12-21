var fs = require("fs");
var _ = require("lodash");
var request = require([__dirname, "..", "lib", "request"].join("/"));
var nomnom = require("nomnom")();

module.exports = {

    nomnom: function(){
        _.each(module.exports.commands, function(command, command_name){
            nomnom.command(command_name).options(command.options).callback(command.callback)
        });

        return nomnom;
    },

    commands: {
        create: {
            options: {
                persistence: {
                    position: 1,
                    help: "Type of persistence to use ['local']",
                    required: true,
                    choices: ["local"]
                },

                file: {
                    help: "Local file to write to",
                    default: ["", "tmp", ["containership", "backup", new Date().valueOf()].join(".")].join("/")
                }
            },

            callback: function(options){
                if(options.persistence == "local"){
                    request.get("applications", {}, function(err, response){
                        if(err){
                            process.stderr.write(["Error writing file to", options.file].join(" "));
                            process.exit(1);
                        }

                        fs.writeFile(options.file, JSON.stringify(response.body), function(err){
                            if(err){
                                process.stderr.write(["Error writing file to", options.file].join(" "));
                                process.exit(1);
                            }

                            console.log(["Successfully wrote file to", options.file].join(" "));
                        });
                    });
                }
            }
        },

        restore: {
            options: {
                persistence: {
                    position: 1,
                    help: "Type of persistence to use ['local']",
                    required: true,
                    choices: ["local"]
                },

                file: {
                    help: "Local file to restore from",
                    required: true
                }
            },
            callback: function(options){
                if(options.persistence == "local"){
                    fs.readFile(options.file, function(err, applications){
                        if(err){
                            process.stderr.write(["Error reading file: ", options.file].join(" "));
                            process.exit(1);
                        }
                        else{
                            request.post("applications", {}, JSON.parse(applications), function(err, response){
                                if(err || response.statusCode != 201){
                                    process.stderr.write("Error restoring applications!");
                                    process.exit(1);
                                }
                                else
                                    console.log("Successfully restored applications!");
                            });
                        }
                    });
                }
            }
        }

    }

}
