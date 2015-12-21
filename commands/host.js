var _ = require("lodash");
var flat = require("flat");
var request = require([__dirname, "..", "lib", "request"].join("/"));
var sprintf = require("sprintf-js").sprintf;
var utils = require([__dirname, "..", "lib", "utils"].join("/"));
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
                request.get("hosts", {}, function(err, response){
                    if(err){
                        process.stderr.write("Could not fetch hosts!");
                        process.exit(1);
                    }

                    console.log(sprintf("%-20s %-30s %-50s %-10s %-20s %-20s %-10s",
                        "ID",
                        "HOST NAME",
                        "START TIME",
                        "MODE",
                        "PRIVATE IP",
                        "PUBLIC IP",
                        "CONTAINERS"
                    ));

                    _.each(_.sortBy(response.body, "id"), function(host){
                        console.log(sprintf("%-20s %-30s %-50s %-10s %-20s %-20s %-10s",
                            host.id,
                            host.host_name,
                            new Date(host.start_time),
                            [host.mode, host.praetor.leader ? "*" : ""].join(""),
                            host.address.private,
                            host.address.public,
                            host.containers.length
                        ));
                    });
                });
            }
        },

        show: {
            options: {
                host: {
                    position: 1,
                    help: "Name of the host to fetch",
                    metavar: "HOST",
                    required: true
                }
            },

            callback: function(options){
                request.get(["hosts", options.host].join("/"), {}, function(err, response){
                    if(err){
                        process.stderr.write(["Could not fetch host", options.host, "!"].join(" "));
                        process.exit(1);
                    }
                    else if(response.statusCode == 404){
                        process.stderr.write(["Host", options.host , "does not exist!"].join(" "));
                        process.exit(1);
                    }
                    else if(response.statusCode != 200){
                        process.stderr.write(response.body.error);
                        process.exit(1);
                    }
                    else{
                        var used_cpus = 0;
                        var used_memory = 0;
                        var overhead = 32;

                        console.log(sprintf("%-20s %-100s", "HOST NAME", response.body.host_name));
                        console.log(sprintf("%-20s %-100s", "START TIME", new Date(response.body.start_time)));
                        console.log(sprintf("%-20s %-100s", "MODE", response.body.mode));
                        if(response.body.mode == "leader")
                            console.log(sprintf("%-20s %-100s", "CONTROLLING LEADER", response.body.praetor.leader));
                        console.log(sprintf("%-20s %-100s", "PORT", response.body.port));
                        console.log(sprintf("%-20s %-100s", "PUBLIC IP", response.body.address.public));
                        console.log(sprintf("%-20s %-100s", "PRIVATE IP", response.body.address.private));
                        console.log();
                        console.log(sprintf("%-20s %-50s %-50s", "TAGS", "NAME", "VALUE"));
                        _.each(flat(response.body.tags), function(val, key){
                            console.log(sprintf("%-20s %-50s %-50s", "", key, val));
                        });
                        console.log();
                        if(response.body.mode == "follower"){
                            console.log(sprintf("%-20s %-50s %-20s %-20s", "CONTAINERS", "ID", "APPLICATION", "STATUS"));
                            _.each(response.body.containers, function(container){
                                used_cpus += parseFloat(container.cpus);
                                used_memory += _.parseInt(container.memory) + overhead;
                                console.log(sprintf("%-20s %-50s %-20s %-20s", "", container.id, container.application, container.status));
                            });
                            console.log();

                            used_cpus = used_cpus.toFixed(2);

                            var available_cpus = parseFloat(response.body.cpus) - used_cpus;
                            var available_memory = (_.parseInt(response.body.memory) / (1024 * 1024)) - used_memory;

                            console.log(sprintf("%-20s %-100s", "AVAILABLE CPUS", available_cpus));
                            console.log(sprintf("%-20s %-100s", "USED CPUS", used_cpus));
                            console.log(sprintf("%-20s %-100s", "AVAILABLE MEMORY", [Math.floor(available_memory), "MB"].join("")));
                            console.log(sprintf("%-20s %-100s", "USED MEMORY", [used_memory, "MB"].join("")));
                        }
                    }
                });
            }
        },

        edit: {
            options: {
                host: {
                    position: 1,
                    help: "Name of the host to edit",
                    metavar: "HOST",
                    required: true
                },

                tag: {
                    help: "host tags",
                    list: true
                }
            },

            callback: function(options){
                var config = _.omit(options, ["0", "_", "host", "subcommand"]);
                if(_.has(config, "tag")){
                    config.tags = utils.parse_tags(config.tag);
                    delete config.tag;
                }

                request.put(["hosts", options.host].join("/"), {}, config, function(err, response){
                    if(err){
                        process.stderr.write(["Could not update host ", options.host, "!"].join(""));
                        process.exit(1);
                    }
                    else if(response.statusCode != 200){
                        process.stderr.write(response.body.error);
                        process.exit(1);
                    }
                    else
                        process.stdout.write(["Successfully updated host ", options.host, "!"].join(""));
                });
            }
        },

        delete: {
            options: {
                host: {
                    position: 1,
                    help: "Name of the host to delete",
                    metavar: "HOST",
                    required: true
                }
            },

            callback: function(options){
                request.delete(["hosts", options.host].join("/"), {}, function(err, response){
                    if(err){
                        process.stderr.write(["Could not delete host", options.host, "!"].join(""));
                        process.exit(1);
                    }
                    else if(response.statusCode == 404){
                        process.stderr.write(["Host", options.host, "does not exist!"].join(" "));
                        process.exit(1);
                    }
                    else if(response.statusCode == 204)
                        process.stdout.write(["Successfully deleted host", options.host, "!"].join(""));
                    else{
                        process.stderr.write(["Could not delete host", options.host, "!"].join(""));
                        process.exit(1);
                    }
                });
            }
        }
    }

}
