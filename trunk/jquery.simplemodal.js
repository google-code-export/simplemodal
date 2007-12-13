/*
 * jQuery SimpleModal plugin 1.0.2
 * http://www.ericmmartin.com/projects/simplemodal/
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
 * The goal of SimpleModal is to provide developers with a cross-browser 
 * overlay and container that will be populated with content provided to
 * SimpleModal.
 *
 * There are two ways to call SimpleModal:
 * 1) As a chained function on a jQuery object, like $('#myDiv).modal();.
 * This call would place the contents of #myDiv inside a modal dialog.
 * Chaining requires a jQuery object. An optional options object can be
 * passed as a parameter.
 *
 * @example $('<div>my content</div>').modal({options});
 * @example $('#myDiv').modal({options});
 * @example jQueryObject.modal({options});
 *
 * 2) As a stand-alone function, like $.modal(content). The content parameter
 * is required and an optional options object can be passed as a second
 * parameter. This method provides more flexibility in the types of content 
 * that are allowed. The content could be a DOM object, a jQuery object, 
 * or a string.
 * 
 * @example $.modal('<div>my content</div>', {options});
 * @example $.modal('my content', {options});
 * @example $.modal($('#myDiv'), {options});
 * @example $.modal(jQueryObject, {options});
 * @example $.modal(document.getElementById('myDiv'), {options}); 
 * 
 * A SimpleModal call can contain multiple elements, but only one modal 
 * dialog can be created at a time. Which means that all of the matched
 * elements will be displayed within the modal container.
 * 
 * The styling for SimpleModal is done mostly through external stylesheets, 
 * providing maximum control over the look and feel.
 *
 * SimpleModal has been tested in the following browsers:
 * - IE 6, 7
 * - Firefox 2
 * - Opera 9
 * - Safari 3
 *
 * @name SimpleModal
 * @type jQuery
 * @requires jQuery v1.1.2
 * @cat Plugins/Windows and Overlays
 * @author Eric Martin (eric@ericmmartin.com || http://ericmmartin.com)
 * @version 1.0.2
 */
(function ($) {
	/**
	 * Stand-alone function to create a modal dialog.
	 * 
	 * @param {string, object} content A string, jQuery object or a DOM object
	 * @param {object} [options] An optional object containing options overrides
	 */
	$.modal = function (content, options) {
		return $.modal.impl.init(content, options);
	};

	/**
	 * Stand-alone remove function to remove all of the modal 
	 * dialog elements from the DOM.
	 * 
	 * @param {object} dialog An object containing the modal dialog elements
	 */
	$.modal.remove = function () {
		$.modal.impl.remove();
	};

	/**
	 * Chained function to create a modal dialog.
	 * 
	 * @param {object} options An optional object containing options overrides
	 */
	$.fn.modal = function (options) {
		return $.modal.impl.init(this, options);
	};

	/**
	 * SimpleModal default options
	 * 
	 * overlay: (Number:50) The opacity value, from 0 - 100
	 * overlayId: (String:'modalOverlay') The DOM element id for the overlay div 
	 * containerId: (String:'modalContainer') The DOM element id for the container div
	 * iframeId: (String:'modalIframe') The DOM element id for the iframe (IE 6)
	 * close: (Boolean:true) Show the default window close icon? Uses CSS class modalCloseImg
	 * closeTitle: (String:'Close') The title value of the default close link. Depends on close
	 * closeClass: (String:'modalClose') The CSS class used to bind to the close event
	 * cloneContent: (Boolean:false) If true, SimpleModal will clone the content element
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
		cloneContent: false,
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
		init: function (content, options) {
			this.opts = $.extend({},
				$.modal.defaults,
				options
			);

			this.dialog.content = $('<div class="modalContent"></div>');

			if (content instanceof jQuery || typeof content == 'object') {
				// convert DOM object to a jQuery object
				content = typeof content == 'object' ? $(content) : content;

				// clone?
				content = this.opts.cloneContent ? content.clone(true) : content;
				this.dialog.content.append(content.show());
			}
			else if (typeof content == 'string') {
				this.dialog.content.html(content);
			}
			else {
				// not sure what to do... ?!?
				alert('unknown type: ' + typeof content);
			}
			content = null;

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
		 * Add the content to the modal container, based on type
		 * - Clone the content, if clone == true
		 */
		create: function () {
			this.dialog.overlay = $('<div></div>')
				.attr('id', this.opts.overlayId)
				.addClass('modalOverlay')
				.css({opacity: this.opts.overlay / 100})
				.hide()
				.appendTo('body');

			if ($.browser.msie && ($.browser.version < 7)) {
				this.fixIE();
			}

			this.dialog.container = $('<div></div>')
				.attr('id', this.opts.containerId)
				.addClass('modalContainer')
				.append(this.opts.close 
					? '<a class="modalCloseImg ' 
						+ this.opts.closeClass 
						+ '" title="' 
						+ this.opts.closeTitle + '"></a>'
					: '')
				.hide()
				.appendTo('body');

			// add the content
			this.dialog.container.append(this.dialog.content);
		},
		/**
		 * Bind events
		 * - Bind the close event onClick to any elements with the 
		 *   closeClass class
		 */
		bindEvents: function () {
			var modal = this;
			$('.' + this.opts.closeClass).click(function (e) {
				e.preventDefault();
				modal.close();
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
				this.dialog.content.show();
			}

			this.bindEvents();
		},
		/**
		 * Close the modal dialog
		 * - Removes the iframe (if necessary), overlay and container
		 * - Removes or hides the content, based on the value of cloneContent
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
				this.opts.cloneContent ? this.dialog.content.remove() : this.dialog.content.hide();
				this.dialog.container.remove();
				this.dialog.overlay.remove();
				if (this.dialog.iframe) {
					this.dialog.iframe.remove();
				}
				this.dialog = {};
			}
			this.unbindEvents();
		},
		/**
		 * Remove the modal dialog elements
		 * - Removes the iframe (if necessary), overlay container and content
		 */
		remove: function () {
			this.opts.cloneContent ? this.dialog.content.remove() : this.dialog.content.hide();
			this.dialog.container.remove();
			this.dialog.overlay.remove();
			if (this.dialog.iframe) {
				this.dialog.iframe.remove();
			}
		}
	};
})(jQuery);