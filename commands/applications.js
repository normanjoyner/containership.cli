var _ = require("lodash");
var flat = require("flat");
var request = require([__dirname, "..", "lib", "request"].join("/"));
var sprintf = require("sprintf-js").sprintf;
var utils = require([__dirname, "..", "lib", "utils"].join("/"));
var config = require([__dirname, "..", "lib", "config"].join("/")).config;

module.exports = {

    init: function(options){
        if(options.subcommand == "list")
            module.exports.list(options);
        else if(_.isNull(options.application)){
            process.stdout.write("Application name required!");
            process.exit(1);
        }
        else if(_.has(module.exports, options.subcommand))
            module.exports[options.subcommand](options);
        else
            console.log([options.subcommand, "subcommand not found!"].join(" "));
    },

    options: {
        subcommand: {
            position: 1,
            help: "application subcommand [list, show, create, edit, scale-up, scale-down, delete]",
            required: true,
            choices: ["list", "show", "create", "edit", "scale-up", "scale-down", "delete"]
        },

        application: {
            position: 2,
            help: "application name",
            default: null
        },

        engine: {
            help: "engine used to control application"
        },

        image: {
            help: "image application will run"
        },

        env_vars: {
            help: "environment variables for application"
        },

        network_mode: {
            help: "networking mode for application"
        },

        port: {
            help: "discovery port for application to listen on"
        },

        command: {
            help: "command application will run"
        },

        tag: {
            help: "application tags",
            list: true
        },

        cpus: {
            help: "number of cpus allocated to application"
        },

        memory: {
            help: "amount of memory allocated to application"
        },

        count: {
            help: "number of containers to add or remove"
        }
    },

    list: function(options){
        request.get(["applications"].join("/"), {}, function(err, response){
            if(err){
                process.stderr.write("Could not fetch applications!");
                process.exit(1);
            }

            console.log(sprintf("%-25s %-10s %-35s %-40s %-10s %-10s %-10s",
                "APPLICATION",
                "ENGINE",
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

                console.log(sprintf("%-25s %-10s %-35s %-40s %-10s %-10s %-10s",
                    application.id,
                    application.engine,
                    application.image,
                    application.command,
                    application.cpus,
                    application.memory,
                    [loaded_containers.length || 0, application.containers.length].join("/")
                ));
            });
        });
    },

    create: function(options){
        var config = _.omit(options, ["0", "_", "application", "subcommand"]);
        if(_.has(config, "tag")){
            config.tags = utils.parse_tags(config.tag);
            delete config.tag;
        }

        request.post(["applications", options.application].join("/"), {}, config, function(err, response){
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
    },

    edit: function(options){
        var config = _.omit(options, ["0", "_", "application", "subcommand"]);
        if(_.has(config, "tag")){
            config.tags = utils.parse_tags(config.tag);
            delete config.tag;
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
    },

    "scale-up": function(options){
        if(!_.has(options, "count"))
            options.count = 1;

        if(_.has(options, "tag")){
            options.tags = utils.parse_tags(config.tag);
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
    },

    "scale-down": function(options){
        if(!_.has(options, "count"))
            options.count = 1;

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
    },

    show: function(options){
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
                console.log(sprintf("%-20s %-100s", "CONTAINER PORT", response.body.container_port));
                console.log(sprintf("%-20s %-100s", "ENV VARS", ""));
                _.each(response.body.env_vars, function(val, key){
                    console.log(sprintf("%-20s %-100s", "", [key, val].join("=")));
                });
                console.log(sprintf("%-20s %-100s", "TAGS", ""));
                _.each(flat(response.body.tags), function(val, key){
                    console.log(sprintf("%-20s %-100s", "", [key, val].join("=")));
                });
                console.log(sprintf("%-20s %-100s", "CONTAINERS", ""));
                _.each(response.body.containers, function(container){
                    console.log(sprintf("%-20s %-100s", "", [container.id, " [", container.host || container.status, "]"].join("")));
                });
            }
        });
    },

    delete: function(options){
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
