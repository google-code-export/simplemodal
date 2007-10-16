/*
 * jQuery SimpleModal plugin 1.0
 * http://code.google.com/p/simplemodal/
 *
 * Copyright (c) 2007 Eric Martin - http://ericmmartin.com
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Revision: $Id$
 *
 */

/**
 * SimpleModal is a lightweight jQuery plugin that provides a simple
 * interface to create a modal dialog.
 *
 * The goal of SimpleModal is to provide the developer with a 
 * cross-browser overlay and container that will be populated with
 * data provided to SimpleModal.
 *
 * @example $('<div>my content</div>').modal(); // must be a jQuery object
 * @example $.modal('<div>my content</div>'); // can be a string/HTML or jQuery Object
 *
 * As a jQuery chained function, SimpleModal accepts a jQuery object.
 * 
 * As a stand-alone function, SimpleModal accepts a jQuery object or a 
 * string, which can contain plain text or HTML.
 * 
 * A SimpleModal call can contain multiple elements, but only one modal 
 * dialog can be created at a time. That means that all of the matched
 * elements will be displayed within the modal container.
 * 
 * The styling for SimpleModal is done mostly through external stylesheets, 
 * providing maximum control over the look and feel.
 *
 * @name SimpleModal
 * @type jQuery
 * @cat Plugins/SimpleModal
 * @author Eric Martin (eric@ericmmartin.com || http://ericmmartin.com)
 */
(function ($) {
	$.fn.modal = function (settings) {
		return $.modal.impl.init(this, settings);
	};

	$.modal = function (data, settings) {
		return $.modal.impl.init(data, settings);
	};

	$.modal.close = function () {
		return $.modal.impl.close();
	};

	$.modal.defaults = {
		overlay: 50,					   // opacity
		overlayId: 'modalOverlay',		   // overlay element id
		containerId: 'modalContainer',	   // container element id
		contentId: 'modalContent',		   // content element id
		iframeId: 'modalIframe',		   // iframe element id
		close: true,					   // show the window close icon?
		closeClass: 'modalClose',		   // close link class
		closeTitle: 'Close',			   // close link title
		cloneData: true,				   // clone the data element?
		onOpen: null,					   // callback function to override open
		onShow: null,					   // callback function
		onClose: null					   // callback function to override close
	};

	$.modal.impl = {
		/**
		 * Place holder for the modal dialog options
		 */
		opts: false,
		/**
		 * Object passed to the callback functions
		 * Should contain the overlay, container and content objects
		 */
		dialog: {},
		/**
		 * Initialize the modal dialog
		 * - Merge the default options with user defined options
		 * - Call the functions to create the modal dialog
		 * - Bind events
		 * - Handle passed in onOpen callback
		 */
		init: function (data, settings) {
			this.data = data;

			this.opts = $.extend({},
				$.modal.defaults,
				settings
			);

			if (this.dialog.overlay) {
				return false;
			}

			this.create();
			this.open();

			// Called after the modal window has been displayed
			// Useful for adding custom events to the modal dialog/content
			if ($.isFunction(this.opts.onShow)) {
				this.opts.onShow.apply(this, [this.dialog]);
			}

			return this;
		},
		/**
		 * Add the modal overlay to the page
		 * - Set the overlay id and append to the page
		 * - Set the opacity of the overlay
		 * - Show the overlay
		 * Add the modal container to the page
		 * - Set the container id and append to the page
		 * - Perform IE fixes, if necessary
		 * - Show the container and reset top position
		 * Add the modal content data to the container
		 * - Set the content id and append to the container
		 * - Handle string data as well as jQuery element(s)
		 * - Add the data
		 */
		create: function () {
			this.dialog.overlay = $('<div></div>')
				.attr('id', this.opts.overlayId)
				.css({opacity: this.opts.overlay / 100})
				.hide()
				.appendTo('body');

			if ($.browser.msie && ($.browser.version < 7)) {
				this.fixIE();
			}

			this.dialog.container = $('<div></div>')
				.attr('id', this.opts.containerId)
				.append(this.opts.close 
					? '<a class="modalCloseImg ' 
						+ this.opts.closeClass 
						+ '" title="' 
						+ this.opts.closeTitle + '"></a>'
					: '')
				.appendTo('body');

			// fix the top position, relative to the viewport, then hide
			this.containerTop();
			this.dialog.container.hide();

			this.dialog.content = $('<div></div>')
				.attr('id', this.opts.contentId)
				.hide()
				.appendTo(this.dialog.container);

			if (typeof this.data === 'string') {
				this.dialog.content.append(this.data);
			}
			else if (this.data.jquery) {
				// If we don't clone the element, it will be removed
				// from the DOM when the modal dialog is closed
				if (this.opts.cloneData) {
					this.data.clone().show().appendTo(this.dialog.content);
				}
				else {
					this.data.show().appendTo(this.dialog.content);
				}
			}
		},
		/**
		 * Bind events
		 * - Any element with a class of closeClass will be bound to the close
		 *   function.
		 */
		bindEvents: function () {
			$('.' + this.opts.closeClass).click(function (e) {
				e.preventDefault();
				$.modal.close();
			});
		},
		unbindEvents: function () {
			$('.' + this.opts.closeClass).unbind('click');
		},
		/**
		 * Fix issues in IE6
		 * - Simulate position:fixed and make sure the overlay height is 100%
		 * - Add an iframe to prevent select options from bleeding through
		 */
		fixIE: function () {
			this.dialog.overlay.css({position: 'absolute', height: $(document).height() + 'px'});
			this.dialog.iframe = $('<iframe src="javascript:false;"></iframe>')
				.attr('id', this.opts.iframeId)
				.css({opacity: 0, position: 'absolute', height: $(document).height() + 'px'})
				.hide()
				.appendTo('body');
		},
		/**
		 * Open the modal dialog
		 * - Shows the overlay, container and content
		 * - Use the onOpen callback, if provided
		 */
		open: function () {
			if (this.dialog.iframe) {
				this.dialog.iframe.show();
			}

			if ($.isFunction(this.opts.onOpen)) {
				this.opts.onOpen.apply(this, [this.dialog]);
			}
			else {
				this.dialog.overlay.show();
				this.dialog.container.show();
				this.dialog.content.show();
			}

			this.bindEvents();
		},
		/**
		 * Close the modal dialog
		 * - Hides [and removes] the elements from the DOM
		 * - Use the onClose callback, if provided
	 	 * - Sets modal dialog to null
		 * - If you use an onClose callback, you must remove the 
		 *   elements manually (overlay, container and iframe)
		 */
		close: function () {
			if ($.isFunction(this.opts.onClose)) {
				this.opts.onClose.apply(this, [this.dialog]);
			}
			else {
				this.dialog.container.hide().remove();
				this.dialog.overlay.hide().remove();
				if (this.dialog.iframe) {
					this.dialog.iframe.hide().remove();
				}
			}

			this.dialog = {};
			
			this.unbindEvents();
			
			return this;
		},
		/**
		 * Determines the top value for the modal container
		 * - Forces the modal dialog to always display in the viewable port
		 * - Warning: if a top value is not defined in the CSS, the container
		 *			will be displayed at the very bottom of the page
		 */
		containerTop: function () {
			var topOffset = 0;
			if (document.documentElement && document.documentElement.scrollTop) {
				topOffset = document.documentElement.scrollTop;
			}
			else if (document.body) {
				topOffset = document.body.scrollTop;
			}
			var currentOffset = this.dialog.container.offset();
			this.dialog.container.css({top: (topOffset + currentOffset.top) + 'px'});
		}
	};

})(jQuery);