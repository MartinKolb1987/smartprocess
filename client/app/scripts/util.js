/*global define*/

define([
    'jquery',
    'backbone',
    'underscore',
    'text!templates/breadcrumb_item.html'
], function ($, Backbone, _, BreadcrumbItemTemplate) {
    'use strict';

	var util = {
		loader: $('#loader'),
		loaderHeight: '10px',
		navLeft: $('#nav-wrapper'),
		navLeftWidth: 250,
		navLeftButton: $('.left > #submenu'),
		navLeftTime: 500,
		leftNav: $('#nav-wrapper > #left-nav'),
		leftNavItems: '',
		appContentWrapper: $('#app-content-wrapper'),
		breakpointWidth: 750,
		breadcrumb: $('#breadcrumb-wrapper > .breadcrumb'),
		currentRoute: '',
		currentSubRoute: '',
		prevRoute : '',
		firstLoad: true,

		toggleLoader: function(){
			if(this.loader.css('height') > '0px'){
				this.loader.transition({height: '0px' });
			} else {
				this.loader.transition({height: this.loaderHeight });
			}
		},

		showLoader: function(){
			this.loader.transition({height: this.loaderHeight });
		},

		hideLoader: function(){
			this.loader.transition({height: '0px' });
		},

		toggleNavLeft: function(){
			if(this.navLeft.css('left') < '0px'){
				this.navLeft.transition({left: '0px', duration: this.navLeftTime });
			} else {
				this.navLeft.transition({left: -this.navLeftWidth + 'px', duration: this.navLeftTime });
			}
			this.navLeftButton.toggleClass('active');
		},

		showNavLeft: function(){
			this.navLeft.transition({left: '0px', duration: this.navLeftTime });
			this.navLeftButton.addClass('active');
		},

		hideNavLeft: function(){
			this.navLeft.transition({left: -this.navLeftWidth + 'px', duration: this.navLeftTime });
			this.navLeftButton.removeClass('active');
		},

		setContentWidth: function(){
			var that = this;
			var newWidth = $(window).width();
			// set content width
			// because of different device resolutions
			if(newWidth > this.breakpointWidth && this.leftNav.css('display') === 'block'){
				newWidth = newWidth - that.navLeftWidth;
			}
			this.appContentWrapper.width(newWidth);

			$(window).resize(_.debounce(function(){
				newWidth = $(window).width();
				if(newWidth > that.breakpointWidth && that.leftNav.css('display') === 'block'){
					newWidth = newWidth - that.navLeftWidth;
				}
				that.appContentWrapper.addClass('window-resize');
				that.appContentWrapper.width(newWidth);
			},500));
		},

		isSmallDevice: function(){
			return (this. breakpointWidth > $(window).width()) ? true : false;
		},

		i18n: { // key = route, value = translation (--> dynamic breadcrumb)
			'dashboard' : 'Startseite',
			'support' : 'Support',
			'quality' : 'Quality',
			'add-ticket' : 'Störung aufgeben',
			'tickets': 'Alle Störungen'
		},

		renderBreadcrumb: function(){
			var that = this;
			var currentRoute = Backbone.history.location.hash;
			currentRoute = currentRoute.substring(1).split('/');
			this.currentRoute = currentRoute[0];
			this.currentSubRoute = currentRoute[1];

			var arrLength = (currentRoute.length - 1),
				count = 0,
				items = '',
				uri = '',
				i = 0,
				active = false;

			$(currentRoute).each(function(index, value) {
				uri = '';
				active = false;

				for(i=0; i<=count; i++){
					uri += currentRoute[i] + '/';
				}
				// check if something is to translate
				if(that.i18n[value] !==  undefined){
					value = that.i18n[value];
				}
				// check if ticket-id
				if(value.length > 20){
					value = 'Detailansicht';
				}
				// check if last item
				if((count-1) === (arrLength-2)){
					active = true;
				}
				items += _.template(BreadcrumbItemTemplate, { itemName: value, uri: uri, active: active});
				count++;
				if(count === arrLength) { return false; }
			});

			this.breadcrumb.html(items).fadeIn();
		},

		setCurrentLeftNavItemActive: function(){
			var leftNavItems = $('#nav-wrapper > #left-nav li');
			var that = this;
			setTimeout(function(){ // because there is a short time delay off Backbone.history
				if(that.prevRoute !== that.currentRoute){ // only change if needed
					that.prevRoute = that.currentRoute;
					leftNavItems.removeClass('active');
					leftNavItems.each(function(index, value){
						var currentItem = $(value);
						if(currentItem.attr('data-route') === that.currentRoute){
							currentItem.addClass('active');
						}
					});
				}

				if(that.isSmallDevice()){
					that.hideNavLeft();
				}

			}, 100);
		},

		getCurrentRoute: function(){
			return this.currentRoute;
		},

		getCurrentSubRoute: function(){
			return this.currentSubRoute;
		}
	};

    return util;

});