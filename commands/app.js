var _ = require("lodash");
var flat = require("flat");
var request = require([__dirname, "..", "lib", "request"].join("/"));
var sprintf = require("sprintf-js").sprintf;
var utils = require([__dirname, "..", "lib", "utils"].join("/"));
var config = require([__dirname, "..", "lib", "config"].join("/")).config;
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
                application: {
                    position: 1,
                    help: "Name of the application to create",
                    metavar: "APPLICATION",
                    required: true
                },

                engine: {
                    help: "Engine used to start application",
                    metavar: "ENGINE",
                    choices: ["docker"],
                    abbr: "x"
                },

                image: {
                    help: "Application image",
                    metavar: "IMAGE",
                    required: true,
                    abbr: "i"
                },

                "env-var": {
                    list: true,
                    help: "Environment variable for application",
                    metavar: "ENV_VAR=VALUE",
                    abbr: "e"
                },

                "network-mode": {
                    help: "Application network mode",
                    metavar: "NETWORK MODE",
                    abbr: "n"
                },

                "container-port": {
                    help: "Port application must listen on",
                    metavar: "PORT",
                    abbr: "p"
                },

                command: {
                    help: "Application start command",
                    metavar: "COMMAND",
                    abbr: "s"
                },

                tag: {
                    help: "Tag to add to application",
                    metavar: "NAME=VALUE",
                    list: true,
                    abbr: "t"
                },

                cpus: {
                    help: "CPUs allocated to application",
                    metavar: "CPUS",
                    abbr: "c"
                },

                memory: {
                    help: "Memory (mb) allocated to application",
                    metavar: "MEMORY",
                    abbr: "m"
                },

                privileged: {
                    help: "Run application containers in privileged mode",
                    metavar: "PRIVILEGED",
                    choices: ["true", "false"]
                },

                respawn: {
                    help: "Respawn application containers when they die",
                    metavar: "RESPAWN",
                    choices: ["true", "false"]
                }
            },

            callback: function(options){
                options = options, _.omit(options, ["0", "_"]);

                if(_.has(options, "tag")){
                    options.tags = utils.parse_tags(options.tag);
                    delete options.tag;
                }

                if(_.has(options, "env-var")){
                    options.env_vars = utils.parse_tags(options["env-var"]);
                    delete options["env-var"];
                }

                if(_.has(options, "network-mode")){
                    options.network_mode = options["network-mode"];
                    delete options["network-mode"];
                }

                if(_.has(options, "container-port")){
                    options.container_port = options["container-port"];
                    delete options["container-port"];
                }

                if(_.has(options, "privileged"))
                    options.privileged = options.privileged == "true";

                if(_.has(options, "respawn"))
                    options.respawn = options.respawn == "true";

                request.post(["applications", options.application].join("/"), {}, options, function(err, response){
                    if(err){
                        process.stderr.write(["Could not create application ", options.application, "!"].join(""));
                        process.exit(1);
                    }
                    else if(response.statusCode != 201){
                        process.stderr.write(response.body.error);
                        process.exit(1);
                    }
                    else
                        process.stdout.write(["Successfully created application ", options.application, "!"].join(""));
                });
            }
        },

        edit: {
            options: {

            },

            callback: function(options){
                var config = _.omit(options, ["0", "_", "application", "subcommand"]);
                if(_.has(config, "tag")){
                    config.tags = utils.parse_tags(config.tag);
                    delete config.tag;
                }

                if(_.has(config, "env-var")){
                    config.env_vars = utils.parse_tags(config["env-var"]);
                    delete config["env-var"];
                }

                request.put(["applications", options.application].join("/"), {}, config, function(err, response){
                    if(err){
                        process.stderr.write(["Could not update application ", options.application, "!"].join(""));
                        process.exit(1);
                    }
                    else if(response.statusCode != 200){
                        process.stderr.write(response.body.error);
                        process.exit(1);
                    }
                    else
                        process.stdout.write(["Successfully updated application ", options.application, "!"].join(""));
                });
            }
        },

        list: {
            options: {},

            callback: function(options){
                request.get("applications", {}, function(err, response){
                    if(err){
                        process.stderr.write("Could not fetch applications!");
                        process.exit(1);
                    }

                    console.log(sprintf("%-35s %-55s %-50s %-5s %-10s %-10s",
                        "APPLICATION",
                        "IMAGE",
                        "COMMAND",
                        "CPUS",
                        "MEMORY",
                        "CONTAINERS"
                    ));

                    _.each(response.body, function(application){
                        var parsed_containers = _.groupBy(application.containers, function(container){
                            return container.status;
                        });

                        var loaded_containers = parsed_containers.loaded || [];

                        console.log(sprintf("%-35s %-55s %-50s %-5s %-10s %-10s",
                            application.id,
                            application.image,
                            application.command,
                            application.cpus,
                            application.memory,
                            [loaded_containers.length || 0, application.containers.length].join("/")
                        ));
                    });
                });
            }
        },

        show: {
            options: {
                application: {
                    position: 1,
                    help: "Name of the application to fetch",
                    metavar: "APPLICATION",
                    required: true
                },
            },

            callback: function(options){
                request.get(["applications", options.application].join("/"), {}, function(err, response){
                    if(err){
                        process.stderr.write(["Could not fetch application", options.application, "!"].join(" "));
                        process.exit(1);
                    }
                    else if(response.statusCode == 404){
                        process.stderr.write(["Application", options.application, "does not exist!"].join(" "));
                        process.exit(1);
                    }
                    else if(response.statusCode != 200){
                        process.stderr.write(response.body.error);
                        process.exit(1);
                    }
                    else{
                        console.log(sprintf("%-20s %-100s", "ENGINE", response.body.engine));
                        console.log(sprintf("%-20s %-100s", "IMAGE", response.body.image));
                        console.log(sprintf("%-20s %-100s", "COMMAND", response.body.command));
                        console.log(sprintf("%-20s %-100s", "CPUS", response.body.cpus));
                        console.log(sprintf("%-20s %-100s", "MEMORY", response.body.memory));
                        console.log(sprintf("%-20s %-100s", "NETWORK MODE", response.body.network_mode));
                        console.log(sprintf("%-20s %-100s", "DISCOVERY PORT", response.body.discovery_port));
                        console.log(sprintf("%-20s %-100s", "CONTAINER PORT", response.body.container_port || ""));
                        console.log();

                        console.log(sprintf("%-20s %-50s %-50s", "ENV VARS", "NAME", "VALUE"));
                        _.each(response.body.env_vars, function(val, key){
                            console.log(sprintf("%-20s %-50s %-50s", "", key, val));
                        });
                        console.log();

                        console.log(sprintf("%-20s %-50s %-50s", "TAGS", "NAME", "VALUE"));
                        _.each(flat(response.body.tags), function(val, key){
                            console.log(sprintf("%-20s %-50s %-50s", "", key, val));
                        });
                        console.log();

                        console.log(sprintf("%-20s %-50s %-20s %-20s", "CONTAINERS", "ID", "HOST", "STATUS"));
                        _.each(response.body.containers, function(container){
                            console.log(sprintf("%-20s %-50s %-20s %-20s", "", container.id, container.host, container.status));
                        });
                    }
                });
            }
        },

        "scale-up": {
            options: {
                application: {
                    position: 1,
                    help: "Name of the application to scale up",
                    metavar: "APPLICATION",
                    required: true
                },

                count: {
                    help: "Number of containers to add",
                    metavar: "NUM CONTAINERS",
                    default: 1
                },

                tag: {
                    help: "Tag to add to new containers",
                    metavar: "NAME=VALUE",
                    list: true
                }
            },

            callback: function(options){
                if(!_.has(options, "count"))
                    options.count = 1;

                if(_.has(options, "tag")){
                    options.tags = utils.parse_tags(options.tag);
                    delete options.tag;
                }
                else
                    options.tags = {};

                request.post(["applications", options.application, "containers"].join("/"), {count: options.count}, {tags: options.tags}, function(err, response){
                    if(err){
                        process.stderr.write(["Could not scale up application ", options.application, "!"].join(""));
                        process.exit(1);
                    }
                    else if(response.statusCode == 404){
                        process.stderr.write(["Application", options.application, "does not exist!"].join(" "));
                        process.exit(1);
                    }
                    else if(response.statusCode != 201){
                        process.stderr.write(response.body.error);
                        process.exit(1);
                    }
                    else
                        process.stdout.write(["Successfully scaled up application ", options.application, "!"].join(""));
                });
            }
        },

        "scale-down": {
            options: {
                application: {
                    position: 1,
                    help: "Name of the application to scale down",
                    metavar: "APPLICATION",
                    required: true
                },

                count: {
                    help: "Number of containers to remove",
                    metavar: "NUM CONTAINERS",
                    default: 1
                }
            },

            callback: function(options){
                request.delete(["applications", options.application, "containers"].join("/"), {count: options.count}, function(err, response){
                    if(err){
                        process.stderr.write(["Could not scale down application ", options.application, "!"].join(""));
                        process.exit(1);
                    }
                    else if(response.statusCode == 404){
                        process.stderr.write(["Application", options.application, "does not exist!"].join(" "));
                        process.exit(1);
                    }
                    else if(response.statusCode != 204){
                        process.stderr.write(response.body.error);
                        process.exit(1);
                    }
                    else
                        process.stdout.write(["Successfully scaled down application ", options.application, "!"].join(""));
                });
            }
        },

        delete: {
            options: {
                application: {
                    position: 1,
                    help: "Name of the application to delete",
                    metavar: "APPLICATION",
                    required: true
                }
            },

            callback: function(options){
                request.delete(["applications", options.application].join("/"), {}, function(err, response){
                    if(err){
                        process.stderr.write(["Could not delete application ", options.application, "!"].join(""));
                        process.exit(1);
                    }
                    else if(response.statusCode == 404){
                        process.stderr.write(["Application", options.application, "does not exist!"].join(" "));
                        process.exit(1);
                    }
                    else if(response.statusCode == 204)
                        process.stdout.write(["Successfully deleted application ", options.application, "!"].join(""));
                    else{
                        process.stderr.write(["Could not delete application ", options.application, "!"].join(""));
                        process.exit(1);
                    }
                });
            }
        }
    }

}
