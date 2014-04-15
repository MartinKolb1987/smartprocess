'use strict';
var express = require('express');
var mongodb = require('mongodb');
var settings = require('../config.json');
require('socket.io');
var supportTickets = null;
var notification = null;

var app = null;
var appWebsocket = null;
var websocket = null;
var saltKey = settings.saltKey;
var collectionSupportTickets = {};

// init
///////////////////////////////////////////////////////////
var init = {

    db: function(){
        var that = this;
        mongodb.connect(settings.mongodbPath, function(err, db) {
            if(err){
                throw err;
            }
            var theDb = db.db(settings.dbName);
            collectionSupportTickets = theDb.collection('supportTickets');
            
            console.log('db connected');

            that.serverIsReady();
        });
    },

    allowedOrigin: function(url){
        var array = settings.allowedHosts;
        if(array.indexOf(url) !== -1){
            return url;
        } else {
            return '';
        }
        // var array = settings.allowedHosts;
        // return (array.indexOf(url) !== -1) ? url : '';
    },

    express: function(){
        app = express();
        app.configure(function() {
            app.use(express.static('public'));
            // app.use(express.cookieParser());
            app.use(express.bodyParser());
            app.use(app.router);
        });

        var that = this;
        app.all('*', function(req, res, next) {
            res.header('Access-Control-Allow-Origin', that.allowedOrigin(req.headers.origin));
            res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
            res.header('Access-Control-Allow-Credentials', 'true');
            next();
        });

        // server listen on port X
        app.listen(settings.serverPort);

    },

    socketIo: function(){
        appWebsocket = express();
        var serverWebsocket = require('http').createServer(appWebsocket);
        websocket = require('socket.io').listen(serverWebsocket);
        websocket.set('log level', 1);
        serverWebsocket.listen(settings.websocketPort);
    },

    serverIsReady: function(){
        supportTickets = require('./support.js')(app, collectionSupportTickets, websocket, saltKey);
        notification = require('./notification.js')(app, collectionSupportTickets, websocket, saltKey);

        // only for demo version
        var that = this;
        setInterval(function() {
            var date = new Date();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            if(hours === 6 && minutes === 1 && seconds === 0){
                that.demoCleanDB();
            }
        }, 1000);
    },

    demoCleanDB: function(){
        var data = [{
                "machine" : "1",
                "module" : "2",
                "priority" : "high",
                "employeName" : "Stefanie Kreuz",
                "description" : "Maschine hängt sich ständig beim Umstellen des NC-Programms auf. Kontinuierlicher Betrieb nicht möglich.",
                "type" : "support",
                "state" : "open",
                "date" : {
                    "publish" : "2013-12-17T20:25:43+01:00",
                    "update" : "2013-12-17T20:25:43+01:00"
                }
            },
            {
                "machine" : "2",
                "module" : "3",
                "priority" : "low",
                "employeName" : "Sepp Maier",
                "description" : "Uhrzeit in Maschinensoftware verstellt.",
                "type" : "support",
                "state" : "open",
                "date" : {
                    "publish" : "2013-12-17T20:32:54+01:00",
                    "update" : "2013-12-17T20:32:54+01:00"
                },
            },
            {
                "date" : {
                    "publish" : "2013-12-17T20:37:08+01:00",
                    "update" : "2013-12-17T20:50:22+01:00"
                },
                "description" : "Bestückkopf weigert sich die Pipetten aus dem Magazin aufzunehmen.",
                "employeName" : "Martin Kolb",
                "machine" : "1",
                "module" : "1",
                "priority" : "high",
                "state" : "in-progress",
                "ticketEdit" : {
                    "employeName" : "Max Mustermann",
                    "replacement" : "",
                    "replacementWorth" : "",
                    "stagnationTime" : "",
                    "description" : "Fehlerbericht wurde an Maschinenhersteller übermittelt."
                },
                "type" : "support"
            },
            {
                "date" : {
                    "publish" : "2013-12-17T20:46:07+01:00",
                    "update" : "2013-12-18T13:19:55+01:00"
                },
                "description" : "Maschine fährt nicht mehr in die Nullposition. Programm kann dadurch nicht mehr geladen werden.",
                "employeName" : "Josef Müller",
                "machine" : "2",
                "module" : "3",
                "priority" : "high",
                "state" : "closed",
                "ticketEdit" : {
                    "employeName" : "Max Mustermann",
                    "replacement" : "",
                    "replacementWorth" : "",
                    "stagnationTime" : "",
                    "description" : "Ersatzteil wurde bestellt.\r\n\r\nMaschine wurde wieder instandgesetzt."
                },
                "type" : "support"
            },
            {
                "date" : {
                    "publish" : "2013-12-18T13:17:03+01:00",
                    "update" : "2014-01-07T13:42:32+01:00"
                },
                "description" : "Maschine defekt.",
                "employeName" : "Benjamin Rauch",
                "machine" : "2",
                "module" : "2",
                "priority" : "low",
                "state" : "in-progress",
                "ticketEdit" : {
                    "employeName" : "Max Mustermann",
                    "replacement" : "",
                    "replacementWorth" : "",
                    "stagnationTime" : "",
                    "description" : ""
                },
                "type" : "support"
            }];

        collectionSupportTickets.remove();
        collectionSupportTickets.insert(data);
    }
};

init.db();
init.express();
init.socketIo();

// general option handler
app.options('/*', function(req, res) {
    res.send(JSON.stringify(res.headers));
});