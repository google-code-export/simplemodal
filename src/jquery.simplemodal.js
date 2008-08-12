/*
 * SimpleModal @VERSION - jQuery Plugin
 * http://www.ericmmartin.com/projects/simplemodal/
 * http://plugins.jquery.com/project/SimpleModal
 * http://code.google.com/p/simplemodal/
 *
 * Copyright (c) 2008 Eric Martin - http://ericmmartin.com
 * Ideas, inspiration and code contributions from:
 *		- Myself =)
 * 	- jQuery UI Dialog, BlockUI, jqModal
 * 	- Aaron Barker
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Revision: $Id$
 *
 */

/*
TODO:
  - prevent tabbing for modal dialog
*/

/**
 * TODO: Summary goes here
 *
 * SimpleModal has been tested in the following browsers:
 * - IE 6, 7
 * - Firefox 2, 3
 * - Flock 1.2
 * - Opera 9, 9.5
 * - Safari 3
 *
 * @name SimpleModal
 * @type jQuery
 * @requires jQuery v1.2.3
 * @cat Plugins/Windows and Overlays
 * @author Eric Martin (http://ericmmartin.com)
 * @version @VERSION
 */
;(function ($) {

	// make sure a valid version of jQuery is being used
	if ($.fn.jquery < "1.2.3") {
		alert('SimpleModal requires jQuery v1.2.3 or higher! You are using v' + $.fn.jquery);
		return;
	}

	// private variables
	var ie6 = $.browser.msie && parseInt($.browser.version) == 6 && !window["XMLHttpRequest"],
		ieQuirks = $.browser.msie && !$.boxModel,
		smid = 0,
		wProps = [],
		zIndex = 1;

	// action function
	$.extend($.fn, {
		modal: function (options) {
			var args = Array.prototype.slice.call(arguments, 1);
			return this.each(function () {
				var isDialog = $(this).is('.simplemodal-data');
				if (typeof options == 'string') {
					var dialog = isDialog ? $.data(this, 'simplemodal') : {};
					if (dialog[options]) {
						dialog[options].apply(dialog, args);
					}
				}
				else if (!isDialog) {
					new $.modal.dialog($(this), options);
				}
			});
		}
	});

	// utility function
	$.modal = function (obj, options) {
		var element = null;

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
			alert('SimpleModal was called using an unsupported data type: ' + typeof obj);
			return;
		}

		// call the action function
		return element.modal(options);
	};

	// alert call to deprecated function
	$.modal.close = function () {
		alert('SimpleModal $.modal.close() function has been deprecated.<br/>Please refer to the documentation.');
	};

	$.modal.defaults = {
		/* callback functions */
		onOpen: null,			// called after the dialog elements are created - usually used for custom opening effects
		onShow: null,			// called after the dialog is opened - usually used for binding events to the dialog
		onClose: null,			// called when the close event is fired - usually used for custom closing effects
		/* dialog options */
		autoOpen: true,		// open when instantiated or open after 'open' call
		autoDestroy: true,	// destroy/remove SimpleModal elements from DOM when closed
		focus: true,			// forces focus to remain on the modal dialog
		persist: false,		// elements taken from the DOM will be re-inserted with changes made
		position: null,		// position of the dialog - [left, top] or will auto center
		zIndex: null,			// the starting z-index value
		/* element id's */
		overlayId: null,		// if not provided, a unique id (simplemodal-overlay-#) will be generated
		containerId: null,	// if not provided, a unique id (simplemodal-container-#) will be generated
		dataId: null,			// if not provided, a unique id (simplemodal-data-#) will be generated
		iframeId: null,		// if not provided, a unique id (simplemodal-ifram-#) will be generated
		/* css properties */
		dataCss: null,
		closeCss: null,
		containerCss: null,
		overlayCss: null,
		iframeCss: null,
		height: 400,
		width: 600,
		/* close options */
		overlayClose: true,
		escClose: true,
		close: true,
		closeElement: '<div>ESC or <a href="#" class="simplemodal-close">Close</a></div>'
	};

	$.modal.dataCss = {};
	$.modal.closeCss = {
		float: 'right',
		fontSize: '.8em',
		padding: '4px'
	};
	$.modal.containerCss = {
		position: 'fixed'
	};
	$.modal.overlayCss = {
		background: '#000',
		left: 0,
		opacity: .6,
		position: 'fixed',
		top: 0
	};
	$.modal.iframeCss = {
		left: 0,
		opacity: 0,
		position: 'fixed',
		top: 0
	};

	$.modal.dialog = function (element, options) {
		// alias this
		var self = this;

		// merge user options with the defaults
		this.options = $.extend({}, $.modal.defaults, options);

		// if close is false, set overlayClose and escClose to false
		if (!this.options.close) {
			this.options.overlayClose = false, this.options.escClose = false;
		}

		// store this dialog for later use
		$.data(element[0], 'simplemodal', this);

		// set flags for callbacks - to prevent recursion
		this.oocb = false, this.oscb = false, this.occb = false;

		// get a unique id
		var uid = ++smid;

		// set z-index
		if (!options || (options && !options.zIndex)) {
			zIndex = uid * 100;
		}

		// did the element come from the DOM
		if (element.show()[0].offsetParent) {
			// keep track of parent element
			this.parent = element.parent();

			// persist changes? if not, make a clone of the element
			if (!this.options.persist) {
				this.original = element.clone(true);
				this.original.hide();
			}
		}
		element.hide();

		// set the window properties
		wProps = _getDimensions();

		// create the iframe
		this.iframe = $('<iframe src="javascript:false;"/>')
			.attr('id', this.options.iframeId || 'simplemodal-iframe-' + uid)
			.addClass('simplemodal-iframe')
			.css($.extend({
					display: 'none',
					height: wProps[0],
					width: wProps[1],
					zIndex: zIndex
				},
				$.modal.iframeCss,
				this.options.iframeCss
			))
			.appendTo('body');

		// create the overlay
		this.overlay = $('<div/>')
			.attr('id', this.options.overlayId || 'simplemodal-overlay-' + uid)
			.addClass('simplemodal-overlay')
			.css($.extend({
					display: 'none',
					height: wProps[0],
					width: wProps[1],
					zIndex: zIndex + 1
				},
				$.modal.overlayCss,
				this.options.overlayCss
			))
			.appendTo('body');

		// create the container
		this.container = $('<div/>')
			.attr('id', this.options.containerId || 'simplemodal-container-' + uid)
			.addClass('simplemodal-container')
			.css($.extend({
					display: 'none',
					height: this.options.height,
					width: this.options.width,
					zIndex: zIndex + 2
				},
				$.modal.containerCss,
				this.options.containerCss
			))
			.appendTo('body');

		this.wrap = $('<div/>')
			.attr('tabIndex', -1)
			.addClass('simplemodal-content')
			.css({height: '100%', outline: 0})
			.appendTo(this.container);

		// add the close element, if enabled
		if (this.options.close) {
			this.wrap.append(
				$(this.options.closeElement)
					.css($.extend({},
						$.modal.closeCss,
						this.options.closeCss
					))
			);
		}

		// add styling and attributes to the data
		this.data = element
			.attr('id', element.attr('id') || this.options.dataId || 'simplemodal-data-' + uid)
			.addClass('simplemodal-data')
			.css($.extend({
					display: 'none'
				},
				$.modal.dataCss,
				this.options.dataCss
			))
			.appendTo(this.wrap);

		// make compatible with code for previous version
		this.content = this.data;

		// position the container
		_setPosition(this);

		// open the dialog if autoOpen is true
		this.options.autoOpen && this.open();
	};

	$.extend($.modal.dialog.prototype, {
		open: function () {
			var self = this;

			// perform ie6 fixes
			ie6 && _fixIE6(self);

			// perform ie7+ quirksmode fixes
			(!ie6 && ieQuirks) && _fixIEQuirks(self);

			// check for onOpen callback
			if ($.isFunction(self.options.onOpen) && !self.oocb) {
				self.oocb = true;
				self.options.onOpen.apply(self, [self]);
			}
			else {
				self.iframe.show();
				self.overlay.show();
				self.container.show();
				self.data.show();
			}
			_show(self);
			_bind(self);
		},
		close: function () {
			var self = this;

			// check for onClose callback
			if ($.isFunction(self.options.onClose) && !self.occb) {
				self.occb = true;
				self.options.onClose.apply(self, [self]);
			}
			else {
				self.data.hide();
				self.container.hide();
				self.overlay.hide();
				self.iframe.hide();
				self.options.autoDestroy && self.destroy();
			}
		},
		destroy: function () {
			$.removeData(this.data[0], 'simplemodal');

			// unbind events
			var id = this.overlay.attr('id');
			this.overlay.unbind('click.' + id);
			$(window).unbind('resize.' + id);
			//$().unbind(this.events);
			$().unbind('focus.simplemodal');
			$().unbind('keydown.esc-' + id);
			this.container.find('.simplemodal-close').unbind('click.' + this.container.attr('id'));

			this.iframe.remove();
			this.overlay.remove();

			// save the changes to the data?
			if (this.parent) {
				if (this.options.persist) {
					// insert the (possibly) modified data back into the DOM
					this.data.removeClass('simplemodal-data').appendTo(this.parent);
				}
				else {
					// remove the current and insert the original, unmodified data back into the DOM
					this.data.remove();
					this.original.appendTo(this.parent);
				}
			}
			else {
				this.data.remove();
			}
			this.container.remove();
		}
	});

	// private functions
	function _bind (dialog) {
		// bind anything with a class of simplemodal-close to the close function
		dialog.container.find('.simplemodal-close').bind('click.' + dialog.container.attr('id'), function (e) {
			e.preventDefault();
			dialog.close();
		});

		// bind the overlay click to the close function, if enabled
		if (dialog.options.overlayClose) {
			dialog.overlay.bind('click.' + dialog.overlay.attr('id'), function (e) {
				e.preventDefault();
				dialog.close();
			});
		}

		// bind onfocus event to force focus on modal dialog
		if (dialog.options.focus) {
			// TODO - implement tabbing contraints
		}

		// bind ESC key to the close function, if enabled
		if (dialog.options.escClose) {
			$().bind('keydown.esc-' + dialog.overlay.attr('id'), function (e) {
				if (e.keyCode == 27) {
					dialog.close();
				}
			});
		}

		// update window size
		$(window).bind('resize.' + dialog.overlay.attr('id'), function () {
			// redetermine the window width/height
			wProps = _getDimensions();

			// reposition the dialog
			_setPosition(dialog);

			// update the overlay
			!ie6 && dialog.overlay.css({height: wProps[0], width: wProps[1]});
		});
	}

	function _fixIE6 (dialog) {
		// simulate fixed position - adapted from BlockUI
		$.each([dialog.iframe, dialog.overlay, dialog.container], function (i, el) {
			var s = el[0].style;
			s.position = 'absolute';
			if (i < 2) {
				s.setExpression('height','document.body.scrollHeight > document.body.offsetHeight ? document.body.scrollHeight : document.body.offsetHeight + "px"');
				s.setExpression('width','jQuery.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
			}
			else {
				s.setExpression('top','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
			}
		});
	}

	function _fixIEQuirks (dialog) {
		$.each([dialog.iframe, dialog.overlay, dialog.container], function (i, el) {
			el.css({position: 'absolute'});
		});
	}

	function _focus (dialog) {
		dialog.wrap.focus();
	}

	function _getDimensions () {
		var el = $(window);

		// fix a jQuery/Opera bug with determining the window height
		var h = $.browser.opera && $.browser.version > "9.5" && $.fn.jquery <= "1.2.6" ?
			document.documentElement["clientHeight"] : 
			el.height();

		return [h, el.width()];
	}

	function _show (dialog) {
		// check for onShow callback
		if ($.isFunction(dialog.options.onShow) && !dialog.oscb) {
			dialog.oscb = true;
			dialog.options.onShow.apply(dialog, [dialog]);
		}
		_focus(dialog);
	}

	function _setPosition (dialog) {
		var top = 0, left = 0;
		if (dialog.options.position && dialog.options.position.constructor == Array) {
			top += dialog.options.position[1];
			left += dialog.options.position[0];
		} else {
			top += (wProps[0]/2) - (dialog.container.height()/2);
			left += (wProps[1]/2) - (dialog.container.width()/2);
		}
		dialog.container.css({left: left, top: top});
	}
})(jQuery);