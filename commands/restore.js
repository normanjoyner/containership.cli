var fs = require("fs");
var _ = require("lodash");
var request = require([__dirname, "..", "lib", "request"].join("/"));

module.exports = {

    init: function(options){
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
    },

    options: {
        persistence: {
            position: 1,
            help: "type of persistence to use [local]",
            required: true,
            choices: ["local"]
        },

        file: {
            help: "local file to restore from",
            required: true
        }
    }

}
