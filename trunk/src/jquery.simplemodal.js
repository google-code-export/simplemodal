/*
 * SimpleModal @VERSION - jQuery Plugin
 * http://www.ericmmartin.com/projects/simplemodal/
 * http://plugins.jquery.com/project/SimpleModal
 * http://code.google.com/p/simplemodal/
 *
 * Copyright (c) 2007 Eric Martin - http://ericmmartin.com
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Revision: $Id$
 *
 */

/**
 * SimpleModal is a lightweight jQuery plugin that provides a simple
 * interface to create a modal dialog.
 *
 * The goal of SimpleModal is to provide developers with a cross-browser 
 * overlay and container that will be populated with data provided to
 * SimpleModal.
 *
 * There are two ways to call SimpleModal:
 * 1) As a chained function on a jQuery object, like $('#myDiv').modal();.
 * This call would place the DOM object, #myDiv, inside a modal dialog.
 * Chaining requires a jQuery object. An optional options object can be
 * passed as a parameter.
 *
 * @example $('<div>my data</div>').modal({options});
 * @example $('#myDiv').modal({options});
 * @example jQueryObject.modal({options});
 *
 * 2) As a stand-alone function, like $.modal(data). The data parameter
 * is required and an optional options object can be passed as a second
 * parameter. This method provides more flexibility in the types of data 
 * that are allowed. The data could be a DOM object, a jQuery object, HTML
 * or a string.
 * 
 * @example $.modal('<div>my data</div>', {options});
 * @example $.modal('my data', {options});
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
 * @author Eric Martin (http://ericmmartin.com)
 * @version @VERSION
 */
(function ($) {
	/*
	 * Stand-alone function to create a modal dialog.
	 * 
	 * @param {string, object} data A string, jQuery object or DOM object
	 * @param {object} [options] An optional object containing options overrides
	 */
	$.modal = function (data, options) {
		return $.modal.impl.init(data, options);
	};

	/*
	 * Stand-alone close function to close the modal dialog
	 */
	$.modal.close = function () {
		$.modal.impl.close(true);
	};

	/*
	 * Chained function to create a modal dialog.
	 * 
	 * @param {object} options An optional object containing options overrides
	 */
	$.fn.modal = function (options) {
		return $.modal.impl.init(this, options);
	};

	/*
	 * SimpleModal default options
	 * 
	 * overlay: (Number:50) The opacity value, from 0 - 100
	 * overlayId: (String:'modalOverlay') The DOM element id for the overlay div 
	 * containerId: (String:'modalContainer') The DOM element id for the container div
	 * iframeId: (String:'modalIframe') The DOM element id for the iframe (IE 6)
	 * close: (Boolean:true) Show the default window close icon? Uses CSS class modalCloseImg
	 * closeTitle: (String:'Close') The title value of the default close link. Depends on close
	 * closeClass: (String:'modalClose') The CSS class used to bind to the close event
	 * persist: (Boolean:false) Persist the data accross modal calls? Only used for existing
	            DOM elements. If true, the data will be maintained across modal calls, if false,
				the data will be reverted to its original state.
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
		persist: false,
		onOpen: null,
		onShow: null,
		onClose: null
	};

	$.modal.impl = {
		/*
		 * Modal dialog options
		 */
		opts: null,
		/*
		 * Place holder for the modal dialog elements
		 * This is also the object passed back to the callback functions
		 * - Should contain the overlay, container and data elements, and
		 *   can also contain the parentNode, original and iframe (for IE 6)
		 *   elements
		 */
		dialog: {},
		/*
		 * Initialize the modal dialog
		 */
		init: function (data, options) {
			// don't allow multiple calls
			if (this.dialog.data) {
				return false;
			}

			// merge defaults and user options
			this.opts = $.extend({}, $.modal.defaults, options);

			// determine how to handle the data based on its type
			if (typeof data == 'object') {
				// convert DOM object to a jQuery object
				data = data instanceof jQuery ? data : $(data);

				// if the object came from the DOM, keep track of its parent
				// and optionally its original state
				if (data.parent().parent().size() > 0) {
					this.dialog.parentNode = data.parent();

					if (!this.opts.persist) {
						this.dialog.original = data.clone(true);
					}
				}
			}
			else if (typeof data == 'string' || typeof data == 'number') {
				// just insert the data as innerHTML
				data = $('<div>').html(data);
			}
			else {
				// unknown type...not sure what to do!
				alert('SimpleModal Error: Invalid data type: ' + typeof data);
				return false;
			}
			this.dialog.data = data;
			data = null;

			// create the modal overlay, container and, if neccessary, iframe
			this.create();

			// display the modal dialog
			this.open();

			// useful for adding custom events to the modal dialog
			if ($.isFunction(this.opts.onShow)) {
				this.opts.onShow.apply(this, [this.dialog]);
			}

			return this;
		},
		/*
		 * Create and add the modal overlay to the page
		 * For IE 6, call fixIE()
		 * Create and add the modal container to the page
		 * - Add the close icon if close == true
		 * Set the top value for the modal container
		 * Add the data to the modal container, based on type
		 */
		create: function () {
			this.dialog.overlay = $('<div>')
				.attr('id', this.opts.overlayId)
				.addClass('modalOverlay')
				.css({opacity: this.opts.overlay / 100})
				.hide()
				.appendTo('body');

			if ($.browser.msie && ($.browser.version < 7)) {
				this.fixIE();
			}

			this.dialog.container = $('<div>')
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

			// add the data
			this.dialog.container.append(this.dialog.data);
		},
		/*
		 * Bind events
		 * - Bind the close event onClick to any elements with the 
		 *   closeClass CSS class
		 */
		bindEvents: function () {
			var modal = this;
			$('.' + this.opts.closeClass).click(function (e) {
				e.preventDefault();
				modal.close();
			});
		},
		/*
		 * Unbind events
		 * - Remove any events bound to the closeClass click event
		 */
		unbindEvents: function () {
			$('.' + this.opts.closeClass).unbind('click');
		},
		/*
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
		/*
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
		/*
		 * Close the modal dialog
		 * - Removes the iframe (if necessary), overlay and container
		 * - Removes or hides the data, based on the data type
		 * - Calls the onOpen callback, if provided
	 	 * - Clears the dialog element
	 	 * - Unbinds any SimpleModal defined events
		 * - Note: If you use an onClose callback, you must remove the 
		 *         overlay, container and iframe elements manually
		 */
		close: function (external) {
			if ($.isFunction(this.opts.onClose) && !external) {
				this.opts.onClose.apply(this, [this.dialog]);
			}
			else {
				// if the data came from the DOM, put it back
				if (this.dialog.parentNode) {
					// save changes to the data?
					if (this.opts.persist) {
						// insert the (possibly) modified data back into the DOM
						this.dialog.data.hide().appendTo(this.dialog.parentNode);
					}
					else {
						// remove the current and insert the original, 
						// unmodified data back into the DOM
						this.dialog.data.remove();
						this.dialog.original.appendTo(this.dialog.parentNode);
					}
				}
				else {
					// otherwise, remove it
					this.dialog.data.remove();
				}

				this.dialog.container.remove();
				this.dialog.overlay.remove();
				if (this.dialog.iframe) {
					this.dialog.iframe.remove();
				}
				this.dialog = {};
			}
			this.unbindEvents();
		}
	};
})(jQuery);