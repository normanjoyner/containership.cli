var request = require("request");
var config = require([__dirname, "config"].join("/")).config;

module.exports = {

    get: function(path, qs, fn){
        var options = {
            url: [config["api-url"], config["api-version"], path].join("/"),
            method: "GET",
            qs: qs,
            json: true,
            strictSSL: config.strict_ssl || true
        }

        request(options, fn);
    },

    put: function(path, qs, body, fn){
        var options = {
            url: [config["api-url"], config["api-version"], path].join("/"),
            method: "PUT",
            qs: qs,
            json: body,
            strictSSL: config.strict_ssl || true
        }

        request(options, fn);
    },

    post: function(path, qs, body, fn){
        var options = {
            url: [config["api-url"], config["api-version"], path].join("/"),
            method: "POST",
            qs: qs,
            json: body,
            strictSSL: config.strict_ssl || true
        }

        request(options, fn);
    },

    delete: function(path, qs, fn){
        var options = {
            url: [config["api-url"], config["api-version"], path].join("/"),
            method: "DELETE",
            qs: qs,
            json: true,
            strictSSL: config.strict_ssl || true
        }

        request(options, fn);
    }

}
