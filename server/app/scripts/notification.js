// support
///////////////////////////////////////////////////////////
'use strict';
var mongodb = require('mongodb');
var moment = require('moment');

module.exports = function(app, collectionSupportTickets, websocket, saltKey){
    // var auth = require('./auth.js')(saltKey, collectionUser);

    app.get('/support-tickets-count',  function(req, res) {
        collectionSupportTickets.find({state: 'open'}).count(function(error, count){
            res.json(count);
        });
    });
};