(function () {
	$.fn.modal = function (options) {
		return this.each(function () {
			new $.modal.dialog($(this), options);
		});
	};

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
			if (window.console) {
				console.log('SimpleModal Error: Unsupported data type: ' + typeof obj);
			}
			return false;
		}
		return element.modal(options);
	};

	$.modal.defaults = {
		onOpen: null,
		onShow: null,
		onClose: null,
		bgiframe: false,
		zIndex: 2000,
		overlayCss: {
			opacity: .5,
			background: '#000'
		},
		containerCss: {
			background: '#fff',
			border: '2px solid #ccc',
			top: 0,
			left: 0
		},
		contentCss: {
			overflow: 'auto',
			width: '100%',
			height: '100%'
		}
	};
	
	$.modal.dialog = function (element, options) {
		this.options = $.extend({}, $.modal.defaults, options);
		
		this.ie6 = $.browser.msie && $.browser.version < 7 ? true : false;
		this.id = $.data(this, 'simplemodal-dialog');
		this.body = {};
		this.body.height = $('body').css('height') || $('body').height();
		this.body.width = $('body').css('width') || $('body').width();
		this.body.overflow = $('body').css('overflow') || 'visible';
		this.body.scrollOffset = window.pageYOffset || $.boxModel && document.documentElement.scrollTop || document.body.scrollTop;
			
		this.overlay = $('<div class="simplemodal-overlay"/>')
			.css($.extend(this.options.overlayCss, {
				height: '100%',
				width: '100%',
				position: 'fixed',
				left: 0,
				top: 0,
				zIndex: ++this.options.zIndex
			}))
			.hide()
			.appendTo('body');
				
		this.container = $('<div class="simplemodal-container"/>')
			.css($.extend(this.options.containerCss, {
				position: 'fixed',
				zIndex: ++this.options.zIndex
			}))
			.hide()
			.appendTo('body');
			
		this.content = $('<div class="simplemodal-content"/>')
			.css($.extend(this.options.contentCss, {}))
			.append(element)
			.appendTo(this.container)
			.hide();
			
		// fix IE 6 issues
		if (this.ie6) {
			// add an iframe to fix z-index issues
			this.options.bgiframe && $.fn.bgiframe 
				? this.overlay.bgiframe() // use bgiframe, if available
				: this.iframe = $('<iframe src="javascript:false;" class="simplemodal-iframe">')
					.css($.extend({}, {
						opacity: 0, 
						position: 'absolute',
						height: '100%',
						width: '100%',
						zIndex: this.overlay.css('zIndex') - 1,
						top: 0,
						left: 0
					}))
					.hide()
					.appendTo('body');
		}

		this.open();
		
		// increment z-index to ensure uniqueness
		$.modal.defaults.zIndex += 5;
	};

	$.modal.dialog.prototype = {
		open: function () {			
			$('body').css({
				height: $(window).height(),
				width: $(window).width()
			});

			$('body').contents().wrapAll(
				$('<div class="simplemodal-body-wrap"/>')
					.css({
						overflow: 'hidden',
						height: $(window).height(),
						width: $(window).width()
					})
			);
			$('.simplemodal-body-wrap')[0].scrollTop = this.body.scrollOffset;

			$.isFunction(this.options.onOpen) 
				? this.options.onOpen.apply(this, [this]) 
				: this.content.show() 
					&& this.container.show() 
					&& this.overlay.show()
					&& (this.ie6 && this.iframe.show());

			// onShow callback
			$.isFunction(this.options.onShow) && this.options.onShow.apply(this, [this]);
			
			// bind close event(s)
			var self = this;
			this.overlay.bind('click.simplemodal-' + this.id, function (e) {
				e.preventDefault();
				self.close();
			});
		},
		close: function () {
			$.isFunction(this.options.onClose) 
				? this.options.onClose.apply(this, [this]) 
				: this.content.hide() 
					&& this.container.hide() 
					&& this.overlay.hide()
					&& (this.ie6 && this.iframe.hide());
					
			this.content.remove() 
					&& this.container.remove() 
					&& this.overlay.remove()
					&& (this.ie6 && this.iframe.remove());
					
			var wrap = $('.simplemodal-body-wrap');
			wrap.contents().appendTo(
				$('body').css({
					height: this.body.height,
					width: this.body.width
				})
			);
			wrap.remove();
			window.scroll(0, this.body.scrollOffset);
			
			this.overlay.unbind('click.simplemodal-' + this.id);
		}
	}
})(jQuery);
