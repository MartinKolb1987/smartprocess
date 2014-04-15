/*global define*/

define([
    'jquery',
    'backbone',
    '../util',
    '../views/login',
    '../views/dashboard',
    '../views/support',
    '../views/quality'
], function ($, Backbone, Util, LoginView, DashboardView, SupportView, QualityView) {
    'use strict';

    var Router = Backbone.Router.extend({

        loginView: new LoginView(),
        dashboardView: new DashboardView(),
        supportView: new SupportView(),
        qualityView: new QualityView(),

        leftNav: $('#nav-wrapper > #left-nav'),
        breadcrumbWrapper: $('#breadcrumb-wrapper .breadcrumb'),
        headerRight: $('#header .right'),
        initLoad: true,

        routes: {
            '' : 'login',
            'dashboard/': 'dashboard',
            'support/': 'support',
            'support/add-ticket/': 'addSupportTicket',
            'support/tickets/': 'supportTickets',
            'support/tickets/:id/': 'supportTicketDetail',
            'quality/': 'quality',
			// 'detail-view-post/:id' : 'detailViewPost',
			'*actions': 'defaultAction'
        },

        login: function(){
            this.loginView.overview();
            this.isNotAuthLayout();
        },

        dashboard: function(){
            this.beforeRoute();
            this.dashboardView.overview();
            this.isAuthLayout();
        },

        // --------------------------------------------------
        // support
        // --------------------------------------------------
        support: function(){
            this.beforeRoute();
            this.supportView.overview();
            this.isAuthLayout();
        },

        addSupportTicket: function(){
            this.beforeRoute();
            this.supportView.addTicketView();
            this.isAuthLayout();
        },

        supportTickets: function(){
            this.beforeRoute();
            this.supportView.ticketsView();
            this.isAuthLayout();
        },

        supportTicketDetail: function(id){
            this.beforeRoute();
            this.supportView.ticketDetailView(id);
            this.isAuthLayout();
        },

        // --------------------------------------------------
        // quality
        // --------------------------------------------------
        quality: function(){
            this.beforeRoute();
            this.qualityView.overview();
            this.isAuthLayout();
        },

        defaultAction: function(){
            Backbone.history.navigate('', true);
            // Backbone.history.navigate('/dashboard', true); // !!! if authentication is implemented redirect to dashboard !!!
        },

        // -------------------------------
        // helpers
        // -------------------------------

        isAuthLayout: function(){
            if(this.initLoad){
                this.leftNav.show();
                Util.setContentWidth();
                this.breadcrumbWrapper.show();
                this.headerRight.show();
                this.initLoad = false;
            }
        },

        isNotAuthLayout: function(){
            this.leftNav.hide();
            Util.setContentWidth();
            this.breadcrumbWrapper.hide();
            this.headerRight.hide();
            this.initLoad = true;
        },

        beforeRoute: function(auth){

            if(this.initLoad){

            }

            // if(auth){
            //     return this.isAuth;
            // } else {
            //     return this.isNotAuth();
            // }
        },

        isAuth: function(){
            // var sessionCookie = jqueryCookie('connect.sid');
            // var userCookie = jqueryCookie('user_b');
            // if(sessionCookie !== '' && sessionCookie !== null && userCookie !== '' && userCookie !== null){
            //     return true;
            // } else {
            //     Backbone.history.navigate('/login', true);
            //     // $('#login_message').html(_.template(MessageTemplate, { message: 'Sorry, for this action you have to sign in.', type: 'error'}));
            // }
        },

        isNotAuth: function(){
            // var userCookie = jqueryCookie('user_b');
            // if(userCookie === '' || userCookie === null){
            //     return true;
            // } else {
            //     Backbone.history.navigate('/dashboard', true);
            //     $('#message').html(_.template(MessageTemplate, { message: 'Sorry, for this action you have to sign out.', type: 'error'}));
            // }
        }

    });

    return Router;
});