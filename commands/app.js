var _ = require("lodash");
var async = require("async");
var flat = require("flat");
var request = require([__dirname, "..", "lib", "request"].join("/"));
var sprintf = require("sprintf-js").sprintf;
var utils = require([__dirname, "..", "lib", "utils"].join("/"));
var config = require([__dirname, "..", "lib", "config"].join("/")).config;
var nomnom = require("nomnom")();
var C2C = require("c2c");
var url = require("url");
var colors = require("colors");

var protocols = {
    http: require("http"),
    https: require("https")
}

module.exports = {

    nomnom: function(){
        _.each(module.exports.commands, function(command, command_name){
            nomnom.command(command_name).options(command.options).callback(command.callback)
        });

        return nomnom;
    },

    commands: {
        "create-from-file": {
            options: {
                "docker-compose": {
                    position: 1,
                    help: "Path to Docker compose file",
                    metavar: "DOCKER-COMPOSE",
                    default: "./docker-compose.yml",
                    required: true
                },
                "containership-compose": {
                    position: 2,
                    help: "Path to ContainerShip compose file",
                    metavar: "CONTAINERSHIP-COMPOSE"
                }
            },

            callback: function(options){
                try{
                    var c2c = new C2C({
                       compose_path: options["docker-compose"],
                       containership_path: options["containership-compose"]
                    });
                }
                catch(err){
                    process.stderr.write(err.message);
                    process.exit(1);
                }

                c2c.convert(function(err, json){
                    if(err){
                        process.stderr.write(err.message);
                        process.exit(1);
                    }

                    request.post("applications", {}, json, function(err, response){
                        if(err){
                            process.stderr.write("Could not create applications!");
                            process.exit(1);
                        }
                        else if(response.statusCode != 201){
                            process.stderr.write(response.body.error);
                            process.exit(1);
                        }
                        else
                            process.stdout.write(["Successfully created", _.keys(json).length, "applications!"].join(" "));
                    });
                });
            }
        },
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

                volume: {
                    help: "Volume to bind-mount for application",
                    metavar: "HOST_PATH:CONTAINER_PATH",
                    list: true,
                    abbr: "b"
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
                options = _.omit(options, ["0", "_"]);

                if(_.has(options, "tag")){
                    options.tags = utils.parse_tags(options.tag);
                    delete options.tag;
                }

                if(_.has(options, "volume")){
                    options.volumes = utils.parse_volumes(options.volume);
                    delete options.volume;
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
                application: {
                    position: 1,
                    help: "Name of the application to edit",
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

                volume: {
                    help: "Volume to bind-mount for application",
                    metavar: "HOST_PATH:CONTAINER_PATH",
                    list: true,
                    abbr: "b"
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
                options = _.omit(options, ["0", "_"]);

                if(_.has(options, "tag")){
                    options.tags = utils.parse_tags(options.tag);
                    delete options.tag;
                }

                if(_.has(options, "volume")){
                    options.volumes = utils.parse_volumes(options.volume);
                    delete options.volume;
                }

                if(_.has(options, "env-var")){
                    options.env_vars = utils.parse_tags(options["env-var"]);
                    delete options["env-var"];
                }

                request.put(["applications", options.application].join("/"), {}, options, function(err, response){
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
        },

        logs: {
            options: {
                application: {
                    position: 1,
                    help: "Name of the application to fetch logs for",
                    metavar: "APPLICATION",
                    required: true
                },
                "container-id": {
                    list: true,
                    help: "container id to fetch logs for",
                    metavar: "CONTAINER_ID"
                },
                all: {
                    help: "fetch logs for all containers",
                    flag: true,
                    default: false
                }
            },

            callback: function(options){
                var local_request = {
                    get: function(path, qs, fn){
                        var options = {
                            url: [config["api-url"], config["api-version"], path].join("/"),
                            headers: config.headers || {},
                            method: "GET",
                            qs: qs,
                            json: true,
                            strictSSL: config.strict_ssl || true
                        }

                        async.waterfall(_.map(config.middleware || [], function(middleware){
                            return function(fn){
                                middleware(options, fn);
                            }
                        }), function(err){
                            var req_opts = {
                                host: url.parse(options.url).hostname,
                                path: url.parse(options.url).path,
                                method: options.method,
                                headers: options.headers || {}
                            }

                            if(url.parse(options.url).port)
                                req_opts.port = url.parse(options.url).port;

                            req_opts.headers["Content-Type"] = "application/json"
                            var protocol = url.parse(options.url).protocol;
                            protocol = protocol.substring(0, protocol.length -1);

                            var req = protocols[protocol].request(req_opts, function(response){
                                return fn(undefined, response);
                            });

                            req.on("error", fn);

                            if(req_opts.method == "POST")
                                req.write(JSON.stringify(options.json));

                            req.end();
                        });
                    }
                }

                var get_application = function(fn){
                    request.get(["applications", options.application].join("/"), {}, function(err, response){
                        if(err)
                            return fn(new Error(["Could not fetch application ", options.application, "!"].join("")));
                        else if(response.statusCode == 404)
                            return fn(new Error(["Application", options.application, "does not exist!"].join(" ")));
                        else if(response.statusCode == 200)
                            return fn(undefined, _.pluck(response.body.containers, "id"));
                    });
                }

                var fetch_logs = function(){
                    _.each(options["container-id"], function(container_id){
                        local_request.get(["logs", options.application, "containers", container_id].join("/"), {}, function(err, response){
                            if(err || response.statusCode != 200)
                                process.stderr.write(["Could not fetch logs for container ", container_id, " of application ", options.application, "!\n"].join(""));
                            else{
                              response.on("data", function(chunk){
                                try{
                                    json = JSON.parse(chunk);
                                    if(json.type == "stdout")
                                        console.log(["[", json.name, "]\t", json.data].join(""));
                                    else if(json.type == "stderr")
                                        console.log(["[", json.name, "]\t", json.data].join("").red);
                                }
                                catch(e){}
                              });
                            }
                        });
                    });
                }

                if(options.all){
                    get_application(function(err, container_ids){
                        if(err){
                            process.stderr.write(err.message);
                            process.exit(1);
                        }
                        else{
                            options["container-id"] = container_ids;
                            fetch_logs();
                        }
                    });
                }
                else if(!options["container-id"]){
                    get_application(function(err, container_ids){
                        if(err){
                            process.stderr.write(err.message);
                            process.exit(1);
                        }
                        else{
                            console.log("Please pass any of the following container ids to fetch logs, or pass the --all flag to get logs for every container:");
                            _.each(container_ids, function(container_id){
                                console.log(container_id);
                            });
                        }
                    });
                }
                else
                    fetch_logs();
            }
        }
    }

}
