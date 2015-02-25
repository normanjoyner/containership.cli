var pkg = require([__dirname, "package"].join("/"));
var ContainershipCLI = require([__dirname, "containership-cli"].join("/"));

module.exports = function(options){
    var cli = new ContainershipCLI();
    cli.version = pkg.version;
    return cli;
}
