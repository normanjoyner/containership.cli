var fs = require("fs");
var _ = require("lodash");
var child_process = require("child_process");

module.exports = {

    init: function(options){
        var pid_location = "/var/run/containership.pid"
        fs.readFile(pid_location, function(err, pid){
            if(err){
                process.stderr.write("Error loading PID file. Does it exist?");
                process.exit(1);
            }
            else{
                child_process.exec(["kill", "-1", pid.toString()].join(" "), function(err, stdout, stderr){
                    if(err){
                        process.stderr.write("Error reloading the ContainerShip agent!");
                        process.exit(1);
                    }
                    else{
                        process.stderr.write("Successfully reloaded the ContainerShip agent!");
                        process.exit(0);
                    }
                });
            }
        });
    },

    options: {}

}
