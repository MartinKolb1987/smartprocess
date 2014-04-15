/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'util',
    'json!../../config.json',
    'text!../templates/login/login.html'
], function ($, _, Backbone, Util, Config, LoginTemplate) {
    'use strict';

    var AppView = Backbone.View.extend({
		el: 'body',
		appContent: $('#app-content'),
		navWrapper: $('#nav-wrapper'),
		leftNav: $('#nav-wrapper > #left-nav'),

		// -------------------------------
		// delegate events
		// -------------------------------
		events: {
			'click .left > #submenu' : 'toggleLeftNavigation',
			'submit form#login' : 'handleLogin',
		},

		// -------------------------------
		// init & render
		// -------------------------------
		initialize: function() {
		},

		render: function(target, value) {
			$(target).html(value).hide().fadeIn();
		},


		// -------------------------------
		// actions
		// -------------------------------

		overview: function(){
			var that = this;
			this.render(that.appContent, _.template(LoginTemplate, {config: Config}));
		},

		toggleLeftNavigation: function(e){ // small device only
			e.preventDefault();
			Util.toggleNavLeft();
		},

		handleLogin: function(e){
			e.preventDefault();
			if(!$(e.currentTarget).hasClass('disabled')){
				var data = $('form#login').serializeJSON();

				if(data.email !== 'admin@webmanufaktur.de' || data.password !== '574857323s'){
					$('#app-login').transition({ x: -40 }, 150).transition({ x: 40 }, 150).transition({ x: 0 }, 150);
				} else {
					Util.appContentWrapper.addClass('window-resize');
					// login accepted
					Backbone.history.navigate('/dashboard/', true);
				}
				
				// var locateModalBody = locateFlagForm.find('.modal-body');
				// var array = locateFlagForm.serializeArray();
				// var flagDescription = array[0].value;
				// var flagId = this.postId;
				// var flagTitle = array[1].value;

				// $.ajax({
				// 	type: 'POST',
				// 	url: TheConfig.nodeUrl + '/flag-post',
				// 	data: {
				// 		type: 'flag',
				// 		id: flagId,
				// 		title: flagTitle,
				// 		description: flagDescription
				// 	}
				// }).done(function() {
				// 	locateModalBody.html('<p><b>Post was flagged.</b> Thank you!</p>');
				// 	$(e.currentTarget).addClass('disabled');
				// });
			}
		}

		// -------------------------------
		// helpers
		// -------------------------------


    });

    return AppView;
});