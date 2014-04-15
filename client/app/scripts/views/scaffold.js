/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'util',
    'json!../../config.json',
    'socketIo',
    'text!../templates/quality/quality_overview.html'
], function ($, _, Backbone, Util, Config, SocketIo, QualityTemplate) {
    'use strict';

    var AppView = Backbone.View.extend({
		el: 'body',
		appContent: $('#app-content'),
		toolItemsWrapper: $('#tool-links > ul'),

		// -------------------------------
		// delegate events
		// -------------------------------
		events: {
		},

		// -------------------------------
		// init & render
		// -------------------------------
		initialize: function() {
			Util.setCurrentLeftNavItemActive();
		},

		render: function(target, value) {
			$(target).html(value);
		},

		// -------------------------------
		// actions
		// -------------------------------
		overview: function(){
			var that = this;
			this.render(that.appContent, _.template(QualityTemplate, {}));
			this.render(that.toolItemsWrapper, '');
			Util.setCurrentLeftNavItemActive();
			Util.renderBreadcrumb();
		},

		// -------------------------------
		// helpers
		// -------------------------------

    });

    return AppView;
});