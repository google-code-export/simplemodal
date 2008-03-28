(function ($) {

	// action function
	$.extend($.fn, {
		modal: function (options) {
			return new $.modal.dialog(this, options);
		}
	});

	// utility function
	$.modal = function (obj, options) {
		var element;

		// check for an ajax request - there will only be one argument, which
		// will actually be the options object and it will contain an ajax property
		if (arguments.length == 1 && obj.ajax) {
			options = obj;
			if (!options.ajax && !$.modal.defaults.ajax) {
				alert('problem');
			}
			else {
				$.ajax({
					url: options.ajax || $.modal.defaults.ajax,
					cache: options.cache || $.modal.defaults.cache,
					method: options.method || $.modal.defaults.method,
					dataType: options.dataType || $.modal.defaults.dataType,
					error: function (event, xhr) {
						alert(xhr.responseText);
					},
					success: function (data) {
						element = $('<div/>').append(data);
					}
				});
			}
		}

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
			window.console && console.log('SimpleModal Error: Unsupported data type: ' + typeof obj);
			return false;
		}
		// call the action function
		element.modal(options);
	};

	$.modal.defaults = {
		/* Callback functions */
		onOpen: null,			// called after the dialog elements are created - usually used for custom opening effects
		onShow: null,			// called after the dialog is opened - usually used for binding events to the dialog
		onClose: null,			// called when the close event is fired - usually used for custom closing effects
		/* Ajax options */
		ajax: null 				// just a reminder for the options property used for ajax calls
		cache: false,			// ajax cache (see: http://docs.jquery.com/Ajax/jQuery.ajax#options)
		method: 'GET',			// ajax method (see: http://docs.jquery.com/Ajax/jQuery.ajax#options)
		dataType: 'html',		// ajax dataType (see: http://docs.jquery.com/Ajax/jQuery.ajax#options)
		/* Effect options */
		effect: null,			// effect options: [slide, fade]
		speed: null				// effect speed options: [slow, normal, fast, # of milliseconds]
	};

	$.modal.dialog = function (element, options) {
		this.options = $.extend({}, $.modal.defaults, options);
	};

	$.extend($.modal.dialog.prototype, {
		open: function () {
		
		}
	});

	
})(jQuery);