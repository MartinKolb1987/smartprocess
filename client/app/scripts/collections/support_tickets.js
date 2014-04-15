/*global define*/

define([
    'underscore',
    'backbone',
    'models/support_ticket',
    'json!../../config.json',
    'socketIo'
], function (_, Backbone, Model, Config, SocketIo) {
    'use strict';

    var SupportTicketCollection = Backbone.Collection.extend({
        model: Model,
        newData: true,

        initialize: function(){
            var that = this;
            var socket = SocketIo.connect(Config.websocketUrl);
            socket.on('new-support-ticket-exist', function(){
                that.newData = true; // needed to load if new data exists
            });
        },

        url: function() {
            return  Config.nodeUrl + '/support-tickets';
        },

        parse: function(response){ // manipulate response data
            return response;
        }
    });

    return SupportTicketCollection;
});