/*
 * SimpleModal @VERSION - jQuery Plugin
 * http://www.ericmmartin.com/projects/simplemodal/
 * http://plugins.jquery.com/project/SimpleModal
 * http://code.google.com/p/simplemodal/
 *
 * Copyright (c) 2008 Eric Martin - http://ericmmartin.com
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Revision: $Id$
 *
 *
 * TODO:
 * - handling content from dom - clone content/parent/etc
 * - add close image or link?
 * - esc key w/ multiple dialogs? option: multiple?
 * - onClose event && recursion
 * - documentation
 * - search TODO's and resolve
 * - consider autoopen option?
 */
 
/**
 * SimpleModal is a lightweight jQuery plugin that provides a simple
 * interface to create a modal dialog.
 *
 * TODO - finish writeup
 *
 * SimpleModal has been tested in the following browsers:
 * - IE 6, 7
 * - Firefox 2, 3
 * - Opera 9
 * - Safari 3
 *
 * @name SimpleModal
 * @type jQuery
 * @requires jQuery v1.1.2 (TODO - check this)
 * @cat Plugins/Windows and Overlays
 * @author Eric Martin (http://ericmmartin.com)
 * @version @VERSION
 */
(function () {

	/**
	 * "Chained" function that takes an optional options object. It instantiates a
	 * modal dialog for every matching element.
	 *
	 * @param {object} [options] An optional object containing options overrides
	 */
	$.fn.modal = function (options) {
		return this.each(function () {
			new $.modal.dialog($(this), options);
		});
	};

	/*
	 * "Stand-alone" function that takes a "data" object and an optional options object. 
	 * If obj is not a jQuery object, this function will convert it to a one and then 
	 * invoke the "chained" modal function.
	 * 
	 * @param {Object} obj A string, jQuery object or DOM object
	 * @param {Object} [options] An optional object containing options overrides
	 */
	$.modal = function (obj, options) {
		var element;

		// determine the datatype for content and handle accordingly
		if (typeof obj == 'object') {
			// convert to a jQuery object, if necessary
			element = obj instanceof jQuery ? obj : $(obj);
		}
		else if (typeof obj == 'string' || typeof obj == 'number') {
			// just insert the content as innerHTML
			element = $('<div/>').html(obj);
		}
		else {
			// unsupported data type
			window.console &&console.log('SimpleModal Error: Unsupported data type: ' + typeof obj);
			return false;
		}
		return element.modal(options);
	};

	/*
	 * SimpleModal default options
	 *
	 * zIndex: (Number:2000) The default z-index value
	 * overlayId: (String:'') The DOM element id for the overlay div
	 * overlayCss: (Object:{}) The CSS styling for the overlay div
	 * containerId: (String:'') The DOM element id for the container div
	 * containerCss: (Object:{}) The CSS styling for the container div
	 * contentId: (String:'') The DOM element id for the content div
	 * contentCss: (String:{}) The CSS styling for the content div
	 * onOpen: (Function:null) The callback function used in place of SimpleModal's open
	 * onShow: (Function:null) The callback function used after the modal dialog has opened
	 * onClose: (Function:null) The callback function used in place of SimpleModal's close
	 * bgiframe: (Boolean:false) Use the bgiframe plugin, if available, to fix IE6 issues
	 */
	$.modal.defaults = {
		zIndex: 2000,
		overlayId: '',
		overlayCss: {
			opacity: .5,
			background: '#000'
		},
		containerId: '',
		containerCss: {
			background: '#fff',
			border: '2px solid #ccc',
			top: '15%',
			left: '50%',
			marginLeft: '-200px',
			height: '400px',
			width: '400px'
		},
		contentId: '',
		contentCss: {
			overflow: 'auto',
			width: '100%',
			height: '100%'
		},
		onOpen: null,
		onShow: null,
		onClose: null,
		bgiframe: false
	};

	$.modal.dialog = function (element, options) {
		this.options = $.extend({}, $.modal.defaults, options);
		
		this.ie6 = $.browser.msie && $.browser.version < 7 ? true : false;
		this.id = $.data(this);

		// save some data about the state of the body
		this.body = {};
		this.body.height = $('body').css('height') || $('body').height();
		this.body.width = $('body').css('width') || $('body').width();
		this.body.overflow = $('body').css('overflow') || 'visible';

		// save some data about the state of the window
		this.window = {};
		this.window.height = $(window).height();
		this.window.width = $(window).width();
		this.window.scrollOffset = window.pageYOffset || $.boxModel && document.documentElement.scrollTop || document.body.scrollTop;

		this.overlay = $('<div class="simplemodal-overlay"/>')
			.attr('id', this.options.overlayId)
			.css($.extend(this.options.overlayCss, {
				height: this.window.height,
				width: this.window.width,
				position: 'absolute',
				left: 0,
				top: 0,
				zIndex: ++this.options.zIndex
			}))
			.hide();

		this.container = $('<div class="simplemodal-container"/>')
			.attr('id', this.options.containerId)
			.css($.extend(this.options.containerCss, {
				position: 'absolute',
				zIndex: ++this.options.zIndex
			}))
			.hide();

		this.content = $('<div class="simplemodal-content"/>')
			.attr('id', this.options.contentId)
			.css($.extend(this.options.contentCss, {}))
			.append(element.show())
			.appendTo(this.container)
			.hide();

		// fix IE 6 issues
		if (this.ie6) {
			// add an iframe to fix z-index issues
			this.options.bgiframe && $.fn.bgiframe 
				? this.overlay.bgiframe() // use bgiframe, if available
				: _fixIe6.apply(this);
		}

		this.open();

		// increment z-index to ensure uniqueness
		$.modal.defaults.zIndex += 5;
	};

	$.modal.dialog.prototype = {
		open: function () {
			$('body').css({
				height: this.window.height,
				width: this.window.width
			});

			if ($('.simplemodal-wrap').length == 0) {
				$('body').contents().wrapAll(
					$('<div class="simplemodal-wrap"/>')
						.css({
							overflow: 'hidden',
							height: this.window.height,
							width: this.window.width
						})
				);
				_addDialog.apply(this);
				$('.simplemodal-wrap')[0].scrollTop = this.window.scrollOffset;
			}
			else {
				_addDialog.apply(this);
			}

			// get a list of tabbable elements
			this.contentElements = $('a, :input:visible', this.container);

			$.isFunction(this.options.onOpen) 
				? this.options.onOpen.apply(this, [this]) 
				: _showDialog.apply(this);

			// onShow callback
			$.isFunction(this.options.onShow) && this.options.onShow.apply(this, [this]);

			_bindEvents.apply(this);
		},
		close: function () {
			_unbindEvents.apply(this);
			
			if ($.isFunction(this.options.onClose)) {
				this.options.onClose.apply(this, [this]);
			}
			else {
				_hideDialog.apply(this);
				this.remove();
			}
		},
		remove: function () {
			_removeDialog.apply(this);
		}
	};

	// private functions
	function _addDialog () {
		this.ie6 && this.iframe.appendTo('body');
		this.overlay.appendTo('body');
		this.container.appendTo('body');
	}

	function _hideDialog () {
		this.content.hide();
		this.container.hide(); 
		this.overlay.hide();
		this.ie6 && this.iframe.hide();
	}

	function _removeDialog () {
		this.content.remove();
		this.container.remove();
		this.overlay.remove();
		this.ie6 && this.iframe.remove();

		if ($('.simplemodal-overlay').length == 0) {
			var wrap = $('.simplemodal-wrap');
			wrap.contents().appendTo(
				$('body').css({
					height: this.body.height,
					width: this.body.width
				})
			);
			wrap.remove();
			window.scroll(0, this.window.scrollOffset);
		}
	} 

	/**
	 * Handles the showing of each of the modal dialog elements using the jQuery show()
	 * function. The iframe will only be shown if the browser is IE6.
	 * This function also sets focus to the content div immediately after the dialog
	 * is opened.
	 * TODO - move the iframe show and focus out, otherwise a callback will miss it
	 */
	function _showDialog () {
		this.ie6 && this.iframe.show();
		this.overlay.show();
		this.container.show();
		this.content.show();
		
		this.contentElements.length > 0 ? $(':input:visible:first', this.content).focus() : this.content.focus();
	}

	/**
	 * Handles the binding of events for the current modal dialog. 
	 * Any element that includes the simplemodal-close class will have the click 
	 * event bound to it, which will fire the close event for the dialog. The ESC
	 * key will also be bound to the close event.
	 * The TAB and ENTER key's will be watched to prevent circumvention of the
	 * modal dialog. See the _keyWatch function.
	 */
	function _bindEvents () {
		var dialog = this;
		
		// click overlay to close (TODO - make this an option or remove)
		this.overlay.bind('click.simplemodal-overlay-' + this.id, function (e) {
			e.preventDefault();
			dialog.close();
		});

		// click to close any element with a class of simplemodal-close
		$('.simplemodal-close', this.container).bind('click.simplemodal-close-' + this.id, function (e) {
			e.preventDefault();
			dialog.close();
		});

		// watch TAB - used keyup because IE doesn't recognize keypress and keydown fires too early
		$().bind('keyup.simplemodal-keyup', function (e) {
			//e.keyCode == 9 && _keyWatch.apply(dialog, [e]); // tab
		});

		// watch ESC and ENTER - again, can't use keypress (IE) and keyup fires to late (ENTER)
		$().bind('keydown.simplemodal-keydown', function (e) {
			e.keyCode == 9 && _keyWatch.apply(dialog, [e]); // tab
			e.keyCode == 13 && _keyWatch.apply(dialog, [e]); // enter
			e.keyCode == 27 && dialog.close(); // esc
		});
	}

	/**
	 * Unbinds the events that were added in the _bindEvents function.
	 */
	function _unbindEvents () {
		this.overlay.unbind('click.simplemodal-overlay' + this.id);
		$('.simplemodal-close', this.container).unbind('click.simplemodal-close' + this.id);
		$().unbind('keyup.simplemodal-keyup').unbind('keydown.simplemodal-keydown');
	}

	/**
	 * Checks to see if the target of the passed in key event is a child of a
	 * SimpleModal content element. If not, it cancels the event and returns 
	 * focus to the SimpleModal content element.
	 * This prevents a user from triggering an event that is supposed to be
	 * hidden by the modal dialog.
	 * @param {Object} e A key* event 
	 */
	function _keyWatch (e) {
		var dialog = this;
		if (this.contentElements.length == 0) {
			this.content.focus();
		}
		else if ((e.shiftKey && e.target == this.contentElements[0]) 
			|| e.target == this.contentElements[this.contentElements.length - 1]) {
			$(':input:visible:first', dialog.content).focus();
			setTimeout(function () {
				//$(':input:visible:first', dialog.content).focus();
			}, 1);
			
			//return false;
		}
	}

	/**
	 *
	 */
	function _fixIe6 () {
		this.iframe = $('<iframe src="javascript:false;" class="simplemodal-iframe">')
			.css($.extend({}, {
				opacity: 0, 
				position: 'absolute',
				height: this.window.height,
				width: this.window.width,
				zIndex: this.overlay.css('zIndex') - 1,
				top: 0,
				left: 0
			}))
			.hide();
	}

})(jQuery);
