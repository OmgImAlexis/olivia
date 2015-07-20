var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    config = require('../config/config.js'),
    Show  = require('../models/Show'),
    User  = require('../models/User'),
    Quality  = require('../models/Quality'),
    Network  = require('../models/Network');

module.exports = (function() {
    var app = express.Router();

    app.get('/', function(req, res){
        Show.find({}).populate('quality network').exec(function(err, shows){
            res.render('index', {
                shows: shows
            });
        });
    });

    app.get('/poster/:mediaType/:mediaId', function(req, res){
        if(req.params.mediaType == 'movie' || req.params.mediaType == 'show'){
            res.sendFile(config.posterLocation  + '/' + req.params.mediaType +'/' + req.params.mediaId);
        } else {
            res.send('??');
        }
    });

    app.all('/getShowInfo', function(req, res){
        var showName = req.body.showName || req.query.showName;
        var provider = req.body.provider || req.query.provider;
        if(provider == 'thetvdb') {
            var TVDB = require("node-tvdb");
            var tvdb = new TVDB(config.apiKeys.thetvdb);
            if(showName.trim() == ''){
                res.send({
                    error: 'No show entered?'
                });
            } else {
                tvdb.getSeriesByName(showName.trim(), function(err, response) {
                    if(err) res.send(err);
                    res.send(response);
                });
            }
        } else {
            res.send({
                error: 'That provider doesn\'t exist on this branch, maybe try switching to the dev branch?'
            });
        }
    });

    app.get('/logs', function(req, res){
        res.send(404);
    });

    app.get('/settings/general', function(req, res){
        res.send(404);
    });

    return app;
})();