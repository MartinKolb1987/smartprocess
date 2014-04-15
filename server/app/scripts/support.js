// support
///////////////////////////////////////////////////////////
'use strict';
var mongodb = require('mongodb');
var moment = require('moment');

module.exports = function(app, collectionSupportTickets, websocket, saltKey){
    // var auth = require('./auth.js')(saltKey, collectionUser);

    app.post('/add-ticket', function(req, res) {
        var data = req.body;

        if(data.machine === '' ||  data.module === '' || data.priority === '' || data.employeName === '' || data.type === ''){
            res.json('error');
            return false;
        }

        data.state = 'open';
        data.date = {
            publish: moment().format(),
            update: moment().format()
        };
        collectionSupportTickets.insert(data, function(err, result) {
            // data.id = result[0]._id;
            websocket.sockets.emit('add-support-ticket', data); // event for notification system
            websocket.sockets.emit('new-support-ticket-exist'); // event for support ticket collection
            res.json('success');
        });
    });

    app.get('/support-tickets',  function(req, res) {
        collectionSupportTickets.find().limit(100).sort({_id: -1}).toArray(function(err, results){
            res.json(results);
        });
    });

    app.get('/support-ticket/:id', function(req, res){
        var BSON = mongodb.BSONPure;
        var oId = new BSON.ObjectID(req.params.id);
        collectionSupportTickets.find({'_id': oId }).toArray(function(err, results){
            res.json(results[0]);
        });
    });

    app.put('/support-ticket/:id', function(req, res){
        var data = req.body;
        data = {
            $set: {
                date: {
                    publish: data.date.publish,
                    update: moment().format()
                },
                state: data.state,
                ticketEdit: data.ticketEdit
            }
        };
        var BSON = mongodb.BSONPure;
        var oId = new BSON.ObjectID(req.params.id);
        collectionSupportTickets.update({'_id': oId }, data, function(){
            res.json('ok');
        });
    });



    // app.post('/pull-request', function(req, res) { //app.post('/pull-request', auth.isAuth, function(req, res) {
    //     var data = {
    //         id: req.body.id,
    //         type: req.body.type,
    //         title: req.body.title,
    //         description: req.body.description,
    //         pullRequestTitle: req.body.pullRequestTitle,
    //         pullRequestUrl: req.body.pullRequestUrl,
    //         submitter: req.user.username,
    //         checked: false,
    //         publishDate: moment().format(),
    //         updateDate: moment().format()
    //     };
    //     collectionNotifications.insert(data, function(err, result) {
    //         data.pullRequestId = result[0]._id;
    //         websocket.sockets.emit('notify-post', data);
    //         res.json('ok');
    //     });
    // });

    // app.get('/notification',  auth.isAuth, function(req, res) {
    //     if(req.query.filter === 'all'){
    //         collectionNotifications.find().sort({'_id': -1}).toArray(function(err, results){
    //             res.json(results);
    //         });
    //     } else if(req.query.filter === 'partial'){
    //         collectionNotifications.find({checked: false}).limit(3).sort({_id: -1}).toArray(function(err, results){
    //             res.json(results);
    //         });
    //     } else if(req.query.filter === 'countUnchecked'){
    //         collectionNotifications.find({checked: false}).count(function(e, count){
    //             var object = {uncheckedNotifications: count};
    //             res.json(object);
    //         });
    //     }
    // });

    // app.get('/notification/:id', auth.isAuth, function(req, res) {
    //     var queryObj = {
    //         $and : [
    //             {id: req.params.id},
    //             {type: 'pull-request'},
    //             {checked: false}
    //         ]
    //     };

    //     collectionNotifications.find(queryObj).sort({ _id: -1}).toArray(function(err, results){
    //         res.json(results);
    //     });
    // });

    // app.put('/notification/:id', auth.isAuth, function(req, res) {
    //     var BSON = mongodb.BSONPure;
    //     var oId = new BSON.ObjectID(req.params.id);
    //     var body = {};

    //     if(req.body.description === ''){
    //         body = {
    //             $set: {
    //                 updateDate: req.body.updateDate,
    //                 checked: req.body.checked
    //             }
    //         };
    //     } else {
    //         body = req.body;
    //     }

    //     delete req.body._id;
    //     collectionNotifications.update({'_id': oId }, body, function(){
    //         res.json('ok');
    //     });
    // });
};