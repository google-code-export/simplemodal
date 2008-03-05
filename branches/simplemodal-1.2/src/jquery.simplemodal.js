(function () {
	$.modal = $.modal || {};

	$.fn.extend({
		modal: function(options) {
			var args = Array.prototype.slice.call(arguments, 1);
			return this.each(function() {
				if (typeof options == "string") {
					var modal = $.data(this, "simplemodal-dialog");
					modal[options].apply(modal, args);

				} else if(!$.data(this, "simplemodal-dialog"))
					new $.modal.dialog(this, options);
			});
		}
	});
	
	$.modal.dialog = function(element, options) {
		this.options = $.extend({}, $.modal.dialog.defaults, options);
		this.element = element;
		var self = this;
		
		// create the dialog
		
		
	};
	
	$.extend($.modal.dialog.prototype, {
		open: function () {
		
		},
		close: function () {
		
		}
	};
	
	$.extend($.modal.dialog, {
		defaults: {
			autoOpen: true,
			bgiframe: false,
			buttons: [],
			draggable: true,
			height: 200,
			minHeight: 100,
			minWidth: 150,
			modal: false,
			overlay: {},
			position: 'center',
			resizable: true,
			width: 300,
			zIndex: 1000
		}
	}
});

/*
	$.fn.modal = function (options) {
		// "this" will always be a jQuery object
		return this.each(function () {
			new $.modal.dialog(this, options);
		});
	};

	$.modal = function (content, options) {
		// determine the datatype for content and handle accordingly
		if (typeof content == 'object') {
			// convert to a jQuery object, if necessary
			content = content instanceof jQuery ? content : $(content);
		}
		else if (typeof content == 'string' || typeof content == 'number') {
			// just insert the content as innerHTML
			content = $('<div/>').html(content);
		}
		else {
			// unsupported data type!
			if (window.console) {
				console.log('SimpleModal Error: Unsupported data type: ' + typeof content);
			}
			return false;
		}
		return content.modal(options);
	};
	
	$.modal.dialog = function (content, options) {
		this.options = $.extend({}, $.modal.defaults, options);
	};
	
	// instance methods
	$.modal.dialog.prototype = {
		
	};
*/
})(jQuery);
