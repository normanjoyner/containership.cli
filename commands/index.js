module.exports = {
    app: require([__dirname, "app"].join("/")),
    backup: require([__dirname, "backup"].join("/")),
    configure: require([__dirname, "configure"].join("/")),
    host: require([__dirname, "host"].join("/")),
    plugin: require([__dirname, "plugin"].join("/")),
    reload: require([__dirname, "reload"].join("/"))
}
