var fs = require("fs");
var _ = require("lodash");
var request = require([__dirname, "..", "lib", "request"].join("/"));

module.exports = {

    init: function(options){
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
    },

    options: {
        persistence: {
            position: 1,
            help: "type of persistence to use [local]",
            required: true,
            choices: ["local"]
        },

        file: {
            help: "local file to write to",
            default: ["", "tmp", ["containership", "backup", new Date().valueOf()].join(".")].join("/")
        }
    }

}
