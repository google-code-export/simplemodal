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
 * The goal of SimpleModal is to provide developers with a 
 * cross-browser overlay and container that will be populated with
 * data provided to SimpleModal.
 *
 * @example $('<div>my content</div>').modal(); // must be a jQuery object
 * @example $.modal('<div>my content</div>'); // can be a string(HTML), DOM element or jQuery Object
 *
 * As a jQuery chained function, SimpleModal acts on a jQuery object 
 * and takes an option settings object as a parameter.
 *
 * @example $('<div>my content</div>').modal({close:false});
 * 
 * As a stand-alone function, SimpleModal takes a jQuery object a DOM 
 * element or a string, which can contain plain text or HTML and an
 * option settings object as parameters.
 *
 * @example $.modal('<div>my content</div>', {close:false});
 * 
 * A SimpleModal call can contain multiple elements, but only one modal 
 * dialog can be created at a time. That means that all of the matched
 * elements will be displayed within the modal container.
 * 
 * The styling for SimpleModal is done mostly through external stylesheets, 
 * providing maximum control over the look and feel.
 *
 * SimpleModal has been tested in the following browsers:
 * - IE 6, 7
 * - Firefox 2
 * - Safari 3
 *
 * @name SimpleModal
 * @type jQuery
 * @requires jQuery v1.2
 * @cat Plugins/SimpleModal
 * @author Eric Martin (eric@ericmmartin.com || http://ericmmartin.com)
 * @version 1.0
 */
(function ($) {
	/**
	 * Stand-alone function to create a modal dialog.
	 * 
	 * @param {String, Object} [data] A string, jQuery object or a DOM object
	 * @param {Object} settings An optional object containing settings overrides
	 */
	$.modal = function (data, settings) {
		return $.modal.impl.init(data, settings);
	};

	/**
	 * Stand-alone close function to close an open modal dialog.
	 */
	$.modal.close = function () {
		return $.modal.impl.close();
	};

	/**
	 * Chained function to create a modal dialog.
	 * 
	 * @param {Object} settings An optional object containing settings overrides
	 */
	$.fn.modal = function (settings) {
		return $.modal.impl.init(this, settings);
	};

	/**
	 * SimpleModal default settings
	 * 
	 * overlay: (Number:50) The opacity value, from 0 - 100
	 * overlaydId: (String:'modalOverlay') The DOM element id for the overlay div 
	 * containerId: (String:'modalContainer') The DOM element id for the container div
	 * iframeId: (String:'modalIframe') The DOM element id for the iframe (IE 6)
	 * close: (Boolean:true) Show the default window close icon? Uses CSS class modalCloseImg
	 * closeTitle: (String:'Close') The title value of the default close link. Depends on close
	 * closeClass: (String:'modalClose') The CSS class used to bind to the close event
	 * cloneData: (Boolean:true) If true, SimpleModal will clone the content data
	 * onOpen: (Function:null) The callback function used in place of SimpleModal's open
	 * onShow: (Function:null) The callback function used after the modal dialog has opened
	 * onClose: (Function:null) The callback function used in place of SimpleModal's close
	 */
	$.modal.defaults = {
		overlay: 50,
		overlayId: 'modalOverlay',
		containerId: 'modalContainer',
		iframeId: 'modalIframe',
		close: true,
		closeTitle: 'Close',
		closeClass: 'modalClose',
		cloneData: true,
		onOpen: null,
		onShow: null,
		onClose: null
	};

	$.modal.impl = {
		/**
		 * Place holder for the modal dialog elements
		 */
		opts: null,
		/**
		 * Object passed to the callback functions
		 * - Should contain the overlay, container and 
		 *   iframe (for IE 6) objects
		 */
		dialog: {},
		/**
		 * Initialize the modal dialog
		 * - Merge the default options with user defined options
		 * - Call the functions to create and open the modal dialog
		 * - Handle the onShow callback
		 */
		init: function (data, settings) {
			this.opts = $.extend({},
				$.modal.defaults,
				settings
			);

			// prevents unexpected calls
			if (this.dialog.overlay) {
				return false;
			}

			// convert to jQuery object if it isn't already
			data = data.jquery ? data : $(data);

			// if we don't clone the element, it will be removed
			// from the DOM when the modal dialog is closed
			this.dialog.data = this.opts.cloneData ? data.clone() : data;
			data = null;

			this.create();
			this.open();

			// Useful for adding custom events to the modal dialog
			if ($.isFunction(this.opts.onShow)) {
				this.opts.onShow.apply(this, [this.dialog]);
			}

			return this;
		},
		/**
		 * Create and add the modal overlay to the page
		 * For IE 6, call fixIE()
		 * Create and add the modal container to the page
		 * - Add the close icon if close == true
		 * Set the top value for the modal container
		 * Add the data to the modal container, based on type
		 * - Clone the data, if clone == true
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

			// add the data
			this.dialog.data.appendTo(this.dialog.container);
		},
		/**
		 * Bind events
		 * - Bind the close event onClick to any elements with the 
		 *   closeClass class
		 */
		bindEvents: function () {
			$('.' + this.opts.closeClass).click(function (e) {
				e.preventDefault();
				$.modal.close();
			});
		},
		/**
		 * Unbind events
		 * - Remove any events bound to the closeClass click event
		 */
		unbindEvents: function () {
			$('.' + this.opts.closeClass).unbind('click');
		},
		/**
		 * Fix issues in IE 6
		 * - Simulate position:fixed and make sure the overlay height and iframe
		 *   height values are set to 100%
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
		 * - Shows the iframe (if necessary), overlay and container
		 * - Calls the onOpen callback, if provided
		 * - Binds any SimpleModal defined events
		 * - Note: If you use the onOpen callback, you must show the 
		 *         overlay and container elements manually 
		 *         (the iframe will be handled by SimpleModal)
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
				this.dialog.data.show();
			}

			this.bindEvents();
		},
		/**
		 * Close the modal dialog
		 * - Removes the iframe (if necessary), overlay and container
		 * - Removes or hides the data, based on the value of cloneData
		 * - Calls the onOpen callback, if provided
	 	 * - Clears the dialog element
	 	 * - Unbinds any SimpleModal defined events
		 * - Note: If you use an onClose callback, you must remove the 
		 *         overlay, container and iframe elements manually
		 */
		close: function () {
			if ($.isFunction(this.opts.onClose)) {
				this.opts.onClose.apply(this, [this.dialog]);
			}
			else {
				this.opts.cloneData ? this.dialog.data.remove() : this.dialog.data.hide();
				this.dialog.container.remove();
				this.dialog.overlay.remove();
				if (this.dialog.iframe) {
					this.dialog.iframe.remove();
				}
			}
			
			this.dialog = {};
			this.unbindEvents();
			
			return this;
		},
		/**
		 * Determines the top value for the modal container
		 * - Forces the modal dialog to always display in the viewable port
		 * - Warning: If a top value is not defined in the CSS, the container
		 *	          will be displayed at the very bottom of the page
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