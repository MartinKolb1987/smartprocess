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
			this.renderStats()
			this.render(that.toolItemsWrapper, '');
			Util.setCurrentLeftNavItemActive();
			Util.renderBreadcrumb();
			$(window).resize(_.debounce(function(){
				that.renderStats();
			}, 1000));
		},

		// -------------------------------
		// helpers
		// -------------------------------
		renderStats: function(){
			setTimeout(function(){
				var statsContainer = $('#stats-container');
				statsContainer.width($('.panel-body').width());
		        statsContainer.highcharts({
		            chart: {
		                type: 'column'
		            },
		            title: {
		                text: 'Anzahl der Qualitätsfälle Gesamt (2013)'
		            },
		            subtitle: {
		                text: ' '
		            },
		            xAxis: {
		                categories: [
		                    'Jan.',
		                    'Feb.',
		                    'März',
		                    'Apr.',
		                    'Mai',
		                    'Juni',
		                    'Juli',
		                    'Aug.',
		                    'Sep.',
		                    'Okt.',
		                    'Nov.',
		                    'Dez.'
		                ]
		            },
		            yAxis: {
		                min: 0,
		                title: {
		                    text: 'Anzahl Qualitätsfälle'
		                }
		            },
		            tooltip: {
		                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
		                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
		                    '<td style="padding:0"><b>{point.y}</b></td></tr>',
		                footerFormat: '</table>',
		                shared: true,
		                useHTML: true
		            },
		            plotOptions: {
		                column: {
		                    pointPadding: 0.2,
		                    borderWidth: 0
		                }
		            },
		            series: [{
		                name: 'Maschine 1',
		                data: [50, 71, 106, 129, 144, 176, 135, 148, 216, 194, 95, 54]
		    
		            }, {
		                name: 'Maschine 2',
		                data: [83, 78, 98, 93, 106, 84, 105, 104, 91, 83, 106, 92]
		    
		            }, {
		                name: 'Maschine 3',
		                data: [48, 38, 39, 41, 47, 48, 59, 59, 52, 65, 59, 51]
		    
		            }],
		            credits: {
					     enabled: true
					}
		        })
			}, 50);
		}

    });

    return AppView;
});