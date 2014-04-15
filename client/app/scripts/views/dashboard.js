/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'util',
    'notification',
    'json!../../config.json',
    'text!../templates/dashboard/dashboard_overview.html',
    'text!../templates/left_nav.html',
    'text!../templates/header_nav.html'
], function ($, _, Backbone, Util, Notification, Config, DashboardTemplate, LeftNavTemplate, HeaderNavTemplate) {
    'use strict';

    var AppView = Backbone.View.extend({
		el: 'body',
		appContent: $('#app-content'),
		navWrapper: $('#nav-wrapper'),
		leftNav: $('#nav-wrapper > #left-nav'),
		toolItemsWrapper: $('#tool-links > ul'),
		leftNavItems: '',

		// -------------------------------
		// delegate events
		// -------------------------------
		events: {
			'click .left > #submenu' : 'toggleLeftNavigation',
			'click #nav-wrapper > #left-nav li' : 'setCurrentLeftNavItemActive',
			'click a.inner-link' : 'setCurrentLeftNavItemActive',
		},

		// -------------------------------
		// init & render
		// -------------------------------
		initialize: function() {
			var that = this;
			// messenger/notification theme
			Messenger.options = {
			    extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
			    theme: 'flat'
			};

			// render left nav once
			this.render(that.leftNav, _.template(LeftNavTemplate));
			// init websockets etc.
			Notification.init();
		},

		render: function(target, value) {
			$(target).html(value);
			// $(target).html(value).hide().fadeIn();
		},

		// -------------------------------
		// actions
		// -------------------------------

		overview: function(){
			var that = this;
			this.render(that.appContent, _.template(DashboardTemplate, {}));
			this.render(that.toolItemsWrapper, '');
			Util.setCurrentLeftNavItemActive();
			Util.renderBreadcrumb();
		},

		toggleLeftNavigation: function(e){
			e.preventDefault();
			Util.toggleNavLeft();
		},

		setCurrentLeftNavItemActive: function(e){
			Util.setCurrentLeftNavItemActive();
		}

		// -------------------------------
		// helpers
		// -------------------------------

    });

    return AppView;
});