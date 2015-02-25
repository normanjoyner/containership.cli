var fs = require("fs");
var _ = require("lodash");

module.exports = {

    load: function(){
        try{
            this.config = JSON.parse(fs.readFileSync([process.env["HOME"], ".containership", "cli.json"].join("/")));
        }
        catch(e){
            process.stdout.write("Could not load Containership config file. Does it exist?");
            process.exit(1);
        }
    },

    set: function(new_config){
        var self = this;
        try{
            var config = JSON.parse(fs.readFileSync([process.env["HOME"], ".containership", "cli.json"].join("/")));
        }
        catch(e){
            var config = {};
        }

        try{
            _.merge(config, new_config);
            fs.writeFileSync([process.env["HOME"], ".containership", "cli.json"].join("/"), JSON.stringify(config));
            this.config = config;
        }
        catch(e){
            process.stdout.write("Could not write Containership config file");
            process.exit(1);
        }
    }
}
