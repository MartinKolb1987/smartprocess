/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        jqueryTransit: {
            deps: ['jquery']
        },
        messenger: {
            deps: ['jquery']
        },
        bootstrapDropdown:{
            deps: ['jquery']
        },
        bootstrapSelect: {
            deps: ['bootstrapDropdown']
        },
        jquerySerializeJson:{
            deps: ['jquery']
        },
        util:{
            deps: ['jqueryTransit']
        },
        chart:{
            deps: ['jquery']
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        text: '../bower_components/requirejs-text/text',
        json: '../bower_components/requirejs-plugins/src/json',
        bootstrap: 'vendor/bootstrap',
        jqueryTransit: '../bower_components/jquery.transit/jquery.transit',
        messenger: '../bower_components/messenger/build/js/messenger',
        bootstrapDropdown: '../bower_components/sass-bootstrap/js/dropdown',
        bootstrapSelect: '../bower_components/bootstrap-select/bootstrap-select',
        jquerySerializeJson: '../bower_components/jquery.serializeJSON/jquery.serializeJSON',
        socketIo: '../bower_components/socket.io-client/dist/socket.io',
        moment: '../bower_components/momentjs/moment',
        chart: '../bower_components/highcharts/highcharts',
        util: 'util',
        notification: 'notification'
    }
});

require([
    'routes/router',
    'jquery',
    'backbone',
    'jqueryTransit',
    'messenger',
    'bootstrapDropdown',
    'bootstrapSelect',
    'jquerySerializeJson'
], function (Router, $, Backbone, jqueryTransit, Messenger, bootstrapDropdown, bootstrapSelect, jquerySerializeJson) {
    // ajax settings (sent cors cookies)
    $.ajaxSetup({ xhrFields: { withCredentials: true }, dataType: 'json'});
    new Router();
    Backbone.history.start();
});
