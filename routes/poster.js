var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    _ = require('underscore'),
    http = require('http'),
    fs = require('fs'),
    util = require('util'),
    config = require('../config/config.js'),
    thetvdb = require('node-tvdb'),
    Show  = require('../models/Show'),
    User  = require('../models/User'),
    Quality  = require('../models/Quality'),
    Episode  = require('../models/Episode'),
    Network  = require('../models/Network'),
    Quality  = require('../models/Quality'),
    Download  = require('../models/Download');

// Makes sure the dir exists if not it makes it.
function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

module.exports = (function() {
    var app = express.Router();

    app.get('/show/:showId', function(req, res){
        var filePath = config.posterLocation  + '/show/' + req.params.showId + '/show.poster';
        fs.stat(filePath, function(err, stat) {
            if(err == null){
                res.sendFile(filePath);
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        ensureExists(config.posterLocation  + '/show/' + req.params.showId + '/', 0744, function(err) {
                            tvdb = new thetvdb(config.apiKeys.thetvdb);
                            tvdb.getBanners(show.providers.thetvdbId, function(error, response) {
                                if(error) res.send(error);
                                var posters = _.where(response, {BannerType: 'poster'});
                                var file = fs.createWriteStream(filePath);
                                var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                    response.pipe(file);
                                    file.on('finish', function() {
                                        res.setHeader('Cache-Control', 'public, max-age=30672000');
                                        res.sendFile(filePath);
                                    });
                                });
                            });
                        });
                    } else {
                        res.send({
                            error: 'Not supported'
                        });
                    }
                });
            }
        });
    });

    app.get('/show/:showId/:seasonNumber', function(req, res){
        var filePath = config.posterLocation  + '/show/' + req.params.showId + '/' + req.params.seasonNumber + '/season.poster';
        fs.stat(filePath, function(err, stat) {
            if(err == null){
                res.sendFile(filePath);
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        ensureExists(config.posterLocation  + '/show/' + req.params.showId + '/' + req.params.seasonNumber + '/', 0744, function(err) {
                            tvdb = new thetvdb(config.apiKeys.thetvdb);
                            tvdb.getBanners(show.providers.thetvdbId, function(error, response) {
                                var posters = _.where(response, {BannerType: 'season', Season: req.params.seasonNumber});
                                var file = fs.createWriteStream(filePath);
                                if(posters.length) {
                                    var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                        response.pipe(file);
                                        file.on('finish', function() {
                                            res.sendFile(filePath);
                                        });
                                    });
                                } else {
                                    var posters =  _.where(response, {BannerType: 'poster'});
                                    var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                        response.pipe(file);
                                        file.on('finish', function() {
                                            res.setHeader('Cache-Control', 'public, max-age=30672000');
                                            res.sendFile(filePath);
                                        });
                                    });
                                }
                            });
                        });
                    } else {
                        res.send({
                            error: 'Not supported'
                        });
                    }
                });
            }
        });
    });

    app.get('/show/:showId/:seasonNumber/:episodeNumber', function(req, res){
        var filePath = config.posterLocation  + '/show/' + req.params.showId + '/' + req.params.seasonNumber + '/' + req.params.episodeNumber + '.poster';
        fs.stat(filePath, function(err, stat) {
            if(err == null){
                res.sendFile(filePath);
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        ensureExists(config.posterLocation  + '/show/' + req.params.showId + '/season/' + req.params.seasonNumber + '/', 0744, function(err) {
                            tvdb = new thetvdb(config.apiKeys.thetvdb);
                            tvdb.getBanners(show.providers.thetvdbId, function(error, response) {
                                var posters = _.where(response, {BannerType: 'season', Season: req.params.seasonNumber});
                                var file = fs.createWriteStream(filePath);
                                if(posters.length) {
                                    var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                        response.pipe(file);
                                        file.on('finish', function() {
                                            res.sendFile(filePath);
                                        });
                                    });
                                } else {
                                    var posters =  _.where(response, {BannerType: 'poster'});
                                    var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                        response.pipe(file);
                                        file.on('finish', function() {
                                            res.sendFile(filePath);
                                        });
                                    });
                                }
                            });
                        });
                    } else {
                        res.send({
                            error: 'Not supported'
                        });
                    }
                });
            }
        });
    });

    return app;
})();