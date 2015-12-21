var _ = require("lodash");
var async = require("async");
var request = require("request");
var config = require([__dirname, "config"].join("/")).config;

module.exports = {

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
            if(err)
                throw err;

            request(options, fn);
        });
    },

    put: function(path, qs, body, fn){
        var options = {
            url: [config["api-url"], config["api-version"], path].join("/"),
            headers: config.headers || {},
            method: "PUT",
            qs: qs,
            json: body,
            strictSSL: config.strict_ssl || true
        }

        async.waterfall(_.map(config.middleware || [], function(middleware){
            return function(fn){
                middleware(options, fn);
            }
        }), function(err){
            if(err)
                throw err;

            request(options, fn);
        });
    },

    post: function(path, qs, body, fn){
        var options = {
            url: [config["api-url"], config["api-version"], path].join("/"),
            headers: config.headers || {},
            method: "POST",
            qs: qs,
            json: body,
            strictSSL: config.strict_ssl || true
        }

        async.waterfall(_.map(config.middleware || [], function(middleware){
            return function(fn){
                middleware(options, fn);
            }
        }), function(err){
            if(err)
                throw err;

            request(options, fn);
        });
    },

    delete: function(path, qs, fn){
        var options = {
            url: [config["api-url"], config["api-version"], path].join("/"),
            headers: config.headers || {},
            method: "DELETE",
            qs: qs,
            json: true,
            strictSSL: config.strict_ssl || true
        }

        async.waterfall(_.map(config.middleware || [], function(middleware){
            return function(fn){
                middleware(options, fn);
            }
        }), function(err){
            if(err)
                throw err;

            request(options, fn);
        });
    }

}
