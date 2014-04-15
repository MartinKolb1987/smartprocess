/*global define*/

define([
    'underscore',
    'backbone',
    'json!../../config.json'
], function (_, Backbone, Config) {
    'use strict';

    var SupportTicketModel = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: function() {
			return Config.nodeUrl + '/support-ticket';
		},
        defaults: {
        }
    });

    return SupportTicketModel;
});