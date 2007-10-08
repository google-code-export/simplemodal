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
 * As a standalone function, SimpleModal accepts a jQuery object or a 
 * string, which can contain plain text or HTML.
 * 
 * A SimpleModal call can contain multiple elements, but only one modal 
 * dialog can be created at a time. That means that all of the matched
 * elements will be dislayed within the modal container.
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
		$.modal.impl.init(this, settings);
		return this;
	};

	$.modal = function (data, settings) {
		$.modal.impl.init(data, settings);
		return this;
	};
	
	$.modal.close = function () {
		$.modal.impl.close();
		return this;
	};

	$.modal.defaults = {
		overlay: 50,					   // opacity
		overlayId: 'modalOverlay',		   // overlay element id
		containerId: 'modalContainer',	   // container element id
		contentId: 'modalContent',		   // content element id
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
			this.opts = $.extend({},
				$.modal.defaults,
				settings
			);
			if (this.dialog.overlay) {
				return false;
			}
			this.createOverlay();
			this.createContainer();
			this.addContent(data);
			this.open();
			this.bindEvents();

			// Called after the modal window has been displayed
			// Useful for adding custom events to the modal dialog/content
			if (this.opts.onShow) {
				this.opts.onShow(this.dialog);
			}
		},
		/**
		 * Add the modal overlay to the page
		 * - Set the overlay id and append to the page
		 * - Set the opacity of the overlay
		 * - Show the overlay
		 */
		createOverlay: function () {
			this.dialog.overlay = $('<div></div>')
				.attr('id', this.opts.overlayId)
				.css({opacity: this.opts.overlay / 100})
				.hide()
				.appendTo('body');
		},
		/**
		 * Add the modal container to the page
		 * - Set the container id and append to the page
		 * - Perform IE fixes, if necessary
		 * - Show the container and reset top position
		 */
		createContainer: function () {
			this.dialog.container = $('<div></div>')
				.attr('id', this.opts.containerId)
				.append(this.closeLink())
				.appendTo('body');

			// fix the top position, relative to the viewport, then hide
			this.containerTop();
			this.dialog.container.hide();

			if ($.browser.msie && ($.browser.version < 7)) {
				this.fixIE();
			}
		},
		/**
		 * Add the modal content data to the container
		 * - Set the content id and append to the container
		 * - Handle string data as well as jQuery element(s)
		 * - Add the data
		 */
		addContent: function (data) {
			this.dialog.content = $('<div></div>')
				.attr('id', this.opts.contentId)
				.hide()
				.appendTo(this.dialog.container);

			if (typeof data === 'string') {
				this.dialog.content.append(data);
			}
			else if (data.jquery) {
				// If we don't clone the element, it will be removed
				// from the DOM when the modal dialog is closed
				if (this.opts.cloneData) {
					data.clone().show().appendTo(this.dialog.content);
				}
				else {
					data.show().appendTo(this.dialog.content);
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
		/**
		 * Fix issues in IE6
		 * - Simulate position:fixed and make sure the overlay height is 100%
		 * - Add an iframe to prevent select options from bleeding through
		 */
		fixIE: function () {
			this.dialog.overlay.css({position: 'absolute', height: $(document).height() + 'px'});
			$('<iframe src="javascript:false;"></iframe>')
				.addClass('modalIframe')
				.css({opacity: 0})
				.appendTo('body');
		},
		/**
		 * Open the modal dialog
		 * - Shows the overlay, container and content
		 * - Use the onOpen callback, if provided
		 */
		open: function () {
			if (this.opts.onOpen) {
				this.opts.onOpen(this.dialog);
			}
			else {
				this.dialog.overlay.show();
				this.dialog.container.show();
				this.dialog.content.show();
			}
		},
		/**
		 * Close the modal dialog
		 * - Hides then removes the element from the DOM
		 * - Use the onClose callback, if provided
		 * - Sets modal dialog to null
		 * - Removes the IE iframe, if necessary
		 */
		close: function () {
			if (this.opts.onClose) {
				this.opts.onClose(this.dialog);
			}
			else {
				this.dialog.container.hide().remove();
				this.dialog.overlay.hide().remove();
			}
			this.dialog = {};
			if ($.browser.msie && ($.browser.version < 7)) {
				$('iframe.modalIframe').remove();
			}
		},
		/**
		 * Builds the modal dialog 'close' link element
		 * - Currently only returns an empty A element
		 * - Returns an empty string if opts.close is false
		 */
		closeLink: function () {
			return this.opts.close ? '<a class="modalCloseImg ' + this.opts.closeClass + '" title="' + this.opts.closeTitle + '"/>' : '';
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