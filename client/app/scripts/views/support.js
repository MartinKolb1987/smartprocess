/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'util',
    'json!../../config.json',
    'notification',
    '../collections/support_tickets',
    '../models/support_ticket',
    'moment',
    'socketIo',
    'chart',
    'text!../templates/support/support_overview.html',
    'text!../templates/support/add_ticket.html',
    'text!../templates/support/tickets_wrapper.html',
    'text!../templates/support/ticket_item.html',
    'text!../templates/support/ticket_detail.html',
    'text!../templates/support/ticket_list_tool_items.html',
    'text!../templates/support/ticket_detail_tool_items.html',
    'text!../templates/left_nav.html',
    'text!../templates/header_nav.html'
], function ($, _, Backbone, Util, Config, Notification, Collection, Model, Moment, SocketIo, Chart, SupportTemplate, AddTicketTemplate, TicketsWrapperTemplate, TicketItemTemplate, TicketDetailtemplate, TicketListToolItems, TicketDetailToolItems, LeftNavTemplate, HeaderNavTemplate) {
    'use strict';

    var AppView = Backbone.View.extend({
		el: 'body',
		appContent: $('#app-content'),
		navWrapper: $('#nav-wrapper'),
		leftNav: $('#nav-wrapper > #left-nav'),
		editTicketWrapper: $('#edit-ticket-wrapper'),
		toolItemsWrapper: $('#tool-links > ul'),
		modalBackground: '',
		closeTicketModal: '',
		collection: {},
		model: {},
		firstSiteLoad: true,

		// -------------------------------
		// delegate events
		// -------------------------------
		events: {
			'submit form#add-ticket-form' : 'saveTicket',
			'change select.priority' : 'setPriority',
			'change select.sort' : 'filterList',
			'click button#submit-edit' : 'editTicket',
			'click button#submit-close' : 'closeTicketModalShow',
			'click #close-ticket-modal #submit-close-cancel' : 'closeTicketModalHide',
			'click #close-ticket-modal #submit-close-go' : 'closeTicketFinal',
			'click button.edit-ticket': 'openEditTicket'
		},

		// -------------------------------
		// init & render
		// -------------------------------
		initialize: function() {
			var publishDate = '',
			publishTime = '',
			template = '',
			socket = SocketIo.connect(Config.websocketUrl);
			socket.on('add-support-ticket', function(data){
				publishDate = new Moment(data.date.publish).format('DD.MM.YY');
				publishTime = new Moment(data.date.publish).format('H:mm');
				template = _.template(TicketItemTemplate, {data: data, publish: [publishDate, publishTime]});
				$('#tickets').prepend(template);
			});

			Util.setCurrentLeftNavItemActive();
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
			this.render(that.appContent, _.template(SupportTemplate, {}));
			this.renderStats();
			this.render(that.toolItemsWrapper, ''),
			Util.renderBreadcrumb();
			$(window).resize(_.debounce(function(){
				that.renderStats();
			}, 1000));
		},

		addTicketView: function(){
			var that = this;
			this.render(that.appContent, _.template(AddTicketTemplate, {}));
			this.render(that.toolItemsWrapper, '');
			Util.renderBreadcrumb();
			$('.selectpicker').selectpicker();
		},

		ticketsView: function(){
			var that = this;
			this.render(that.appContent, _.template(TicketsWrapperTemplate, {}));
			Util.renderBreadcrumb();
			// check if new data exists or first site load
			if(this.collection.newData || this.firstSiteLoad){
				this.fetchData('renderTicketItemView');
				Util.showLoader();
			} else {
				this.ticketItemView();
			}

		},

		ticketItemView: function(){
			var template = '';
			var publishDate= '',
			publishTime = '',
			that = this;
			_.each(this.collection.models, function(value){
				publishDate = new Moment(value.attributes.date.publish).format('DD.MM.YY');
				publishTime = new Moment(value.attributes.date.publish).format('H:mm');
				template += _.template(TicketItemTemplate, {data: value.attributes, publish: [publishDate, publishTime]});
			});
			this.render($('#tickets'), _.template(template, {}));
			this.render(that.toolItemsWrapper, TicketListToolItems);
			$('.selectpicker').selectpicker();
		},

		ticketDetailView: function(id){
			var that = this;
			var publishDate = '',
			publishTime = '';
			Util.renderBreadcrumb();

			if(this.collection.newData || this.firstSiteLoad){
				// new data, after site load
				this.model = new Model({_id: id});
				this.model.fetch({
					success: function(model){
						publishDate = new Moment(model.attributes.date.publish).format('DD.MM.YY');
						publishTime = new Moment(model.attributes.date.publish).format('H:mm');
						that.render(that.appContent, _.template(TicketDetailtemplate, {data: model.attributes, publishDate: publishDate, publishTime: publishTime}));
						that.render(that.toolItemsWrapper, TicketDetailToolItems);
						$('.selectpicker').selectpicker();
						that.modalBackground = $('#modal-background');
						that.closeTicketModal = $('#close-ticket-modal');
						// maybe request comes from the notification center
						// if collection already exists, but not updated yet --> add to collection
						if(!that.firstSiteLoad){
							that.collection.add(model);
						}
					}
				});
			} else {
				// old data
				var data = this.collection.get(id);
				this.model = data;
				publishDate = new Moment(data.attributes.date.publish).format('DD.MM.YY');
				publishTime = new Moment(data.attributes.date.publish).format('H:mm');
				this.render(that.appContent, _.template(TicketDetailtemplate, {data: data.attributes, publishDate: publishDate, publishTime: publishTime}));
				this.render(that.toolItemsWrapper, TicketDetailToolItems);
				$('.selectpicker').selectpicker();
				this.modalBackground = $('#modal-background');
				this.closeTicketModal = $('#close-ticket-modal');
			}

		},


		// -------------------------------
		// helpers
		// -------------------------------

		fetchData: function(view){
			var that = this;
			this.collection = {};
			this.collection = new Collection();
			this.collection.fetch({
				success: function(collection) {
					that.collection = collection;
					// what kind of view would you like to render
					if(view === 'renderTicketItemView'){
						that.ticketItemView();
					}
					Util.hideLoader();
				},
				error: function(){
					console.log('error - no data was fetched');
					Util.hideLoader();
				}
			});
			this.collection.newData = false;
			this.firstSiteLoad = false;
		},

		saveTicket: function(e){
			e.preventDefault();
			var that = this;
			// Util.showLoader();
			if(!$(e.currentTarget).hasClass('disabled')){
				var form = $('form#add-ticket-form');
				var data = form.serializeJSON();
				data.type = 'support';

				var error = false;
				var message = '';

				// client-side check
				if(data.machine === ''){
					message = 'Bitte Maschine auswählen.';
					error = true;
				} else if(data.module === ''){
					message = 'Bitte Modul auswählen.';
					error = true;
				} else if(data.priority === ''){
					message = 'Bitte Priorität auswählen.';
					error = true;
				} else if(data.employeName === ''){
					message = 'Bitte Mitarbeiter auswählen.';
					error = true;
				}

				// show notification
				if(error){
					new Messenger().post({
						message: message,
						type: 'error',
						showCloseButton: true,
						hideAfter: 5
					});
				}

				// send to server
				if(!error){
					$.ajax({
						type: 'POST',
						url: Config.nodeUrl + '/add-ticket',
						data: data
					}).done(function(data) {
						if(data === 'success'){
							new Messenger().post({
								message: 'Supportanfrage wurde erfolgreich aufgegeben!',
								type: 'success',
								showCloseButton: true,
								hideAfter: 5
							});
							// render view again (empty form etc.)
							that.render(that.appContent, _.template(AddTicketTemplate, {}));
							that.render(that.toolItemsWrapper, '');
							$('.selectpicker').selectpicker();

							// notification counter 
							Notification.supportTicketsCount.open = ++Notification.supportTicketsCount.open;
							Notification.renderSupportCounter();

						} else {
							new Messenger().post({
								message: 'Supportanfrage konnte nicht gespeichert werden!',
								type: 'error',
								showCloseButton: true,
								hideAfter: 5
							});
							// Util.hideLoader();
						}
					}).fail(function() {
						new Messenger().post({
							message: 'Server nicht erreichbar',
							type: 'error',
							showCloseButton: true,
							hideAfter: 15
						});
					});
				}

			}
		},


		editTicket: function(e){
			this.updateTicket(e, 'update-ticket');
		},

		closeTicketModalShow: function(e){
			e.preventDefault();
			this.closeTicketModal.show().transition({ opacity: 1 });
			this.modalBackground.show().transition({ opacity: 0.4 });
		},

		closeTicketModalHide: function(e){
			e.preventDefault();
			this.closeTicketModal.hide().transition({ opacity: 0 });
			this.modalBackground.hide().transition({ opacity: 0 });
		},

		closeTicketFinal: function(e){
			this.updateTicket(e, 'close-ticket');
			this.closeTicketModalHide(e);
		},

		updateTicket: function(e, kindOfUpdate){
			e.preventDefault();
			var that = this;

			if(!$(e.currentTarget).hasClass('disabled')){
				var form = $('form#edit-ticket-form');
				var data = form.serializeJSON();
				// needed for local data (whiteout any server-request-update)
				var updateData = { 
					state: 'in-progress',
					ticketEdit: data
				};

				if(kindOfUpdate === 'close-ticket'){
					updateData.state = 'closed'; 
				}

				this.model.set(updateData);
				this.model.save(null, {
					success: function(){
						new Messenger().post({
							message: 'Ticket wurde aktualisiert!',
							type: 'success',
							showCloseButton: true,
							hideAfter: 5
						});
						if(!that.firstSiteLoad){
							// update because of the same oid
							that.collection.add(that.model);
						}

						if($('#edit-ticket-wrapper').hasClass('closed')){
							// notification counter 
							Notification.supportTicketsCount.open = --Notification.supportTicketsCount.open;
							Notification.renderSupportCounter();
						}

						// rerender view
						that.ticketDetailView(that.closeTicketModal.attr('data-ticket-id'));
					},
					error: function(){
						new Messenger().post({
							message: 'Ticketbearbeitung konnte nicht gespeichert werden!',
							type: 'error',
							showCloseButton: true,
							hideAfter: 5
						});
					}
				});
			}
		},

		setPriority: function(e){
			var value = $(e.target.options[e.target.selectedIndex]).attr('class');
			$(e.currentTarget).next().find('.dropdown-toggle').removeClass('btn-default btn-low btn-warning btn-danger').addClass(value);
		},

		filterList: function(e){
			var value = $(e.target.options[e.target.selectedIndex]).attr('value');
			var itemsWrapper = $('#tickets');
			var all = itemsWrapper.find('.item');
			if(value === 'all'){
				all.show();
			} else if(value === 'open'){
				all.hide();
				itemsWrapper.find('.item[data-state="open"]').show();
			} else if(value === 'in-progress'){
				all.hide();
				itemsWrapper.find('.item[data-state="in-progress"]').show();
			} else if(value === 'closed'){
				all.hide();
				itemsWrapper.find('.item[data-state="closed"]').show();
			}
		},

		openEditTicket: function(){
			var editTicketWrapper = $('#edit-ticket-wrapper.closed');
			if(editTicketWrapper.css('opacity') !== '0'){
				editTicketWrapper.transition({ opacity: 0});
			} else {
				editTicketWrapper.transition({ opacity: 1});
			}
		},

		renderStats: function(){
			setTimeout(function(){
				var statsContainer = $('#stats-container');
				statsContainer.width($('.panel-body').width());
		        statsContainer.highcharts({
				    chart: {
				        type: 'area',
				        spacingBottom: 30
				    },
				    title: {
				        text: 'Anzahl der Störungen Gesamt (2013)'
				    },
				    legend: {
				        layout: 'horizontal',
				        align: 'left',
				        verticalAlign: 'top',
				        x: 150,
				        y: 100,
				        floating: true,
				        borderWidth: 1,
				        backgroundColor: '#FFFFFF'
				    },
				    xAxis: {
				        categories: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.']
				    },
				    yAxis: {
				        title: {
				            text: 'Anzahl der Störungen'
				        },
				        labels: {
				            formatter: function() {
				                return this.value;
				            }
				        }
				    },
				    tooltip: {
				        formatter: function() {
				            return '<b>' + this.x + ': ' + this.y + '</b>';
				        }
				    },
				    plotOptions: {
				        area: {
				            fillOpacity: 0.5
				        }
				    },
				    credits: {
				        enabled: true
				    },
				    series: [{
				        name: 'Januar - Dezember 2013',
				        data: [0, 1, 4, 4, 5, 2, 8, 7, 4, 20, 11, 3]
				    }]
				});
			}, 50);
		},


    });

    return AppView;
});