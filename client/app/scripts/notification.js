/*global define*/

define([
    'jquery',
    'backbone',
    'underscore',
    'util',
    'json!../config.json',
    'socketIo'
], function ($, Backbone, _, Util, Config, SocketIo) {
    'use strict';

    var notification = {
		leftNav: $('#nav-wrapper > #left-nav'),
		websocket: '',
		supportTicketsCount: {
			open: 0
		},

		init: function(){ // triggerd from dashboard.js
			var that = this;
			var socket = SocketIo.connect(Config.websocketUrl);
			socket.on('connect', function(){
				that.websocket = socket;
				that.addEventListener();
			});
			this.initLoadCounter();
		},

		initLoadCounter: function(){
			var that = this;
			$.ajax({
				type: 'GET',
				url: Config.nodeUrl + '/support-tickets-count'
			}).done(function(data) {
				that.supportTicketsCount.open = data;
				that.renderSupportCounter();
			}).fail(function() {
				console.log('init load counter failed');
			});
		},

		renderSupportCounter: function(){
			var that = this;
			if(this.supportTicketsCount.open !== 0){
				that.leftNav.find('li #support-counter').text(that.supportTicketsCount.open);
			} else {
				that.leftNav.find('li #support-counter').text('');
			}
		},

		addEventListener: function(){
			// add ticket
			this.websocket.on('add-support-ticket', function(data){
				var message = 'Priorität: ' + data.priority + ' - Typ: ' + data.type + '<br> Maschine ' + data.machine + ' - Modul ' + data.module;

				if(Util.getCurrentSubRoute() !== 'add-ticket'){
					new Messenger().post({
						message: message,
						type: 'info',
						showCloseButton: true,
						hideAfter: 10,
						actions: {
							okay: {
								label: 'Details',
								action: function() {
									Backbone.history.navigate('/support/tickets/' + data._id + '/' , true);
								}
							}
						}
					});
				}
			});
    	}

    	// -------------------------------
    	// helpers
    	// -------------------------------

    };

    return notification;

});