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
(function($){
    var container,
        overlay;

    $.fn.modal = function(settings) {
        $.modal.impl.init(this, settings);
    };

    $.modal = function(data, settings) {
        $.modal.impl.init(data, settings);
    };

    $.modal.defaults = {
        overlay: 50, // opacity
        overlayId: 'modalOverlay',
        containerId: 'modalContainer',
        close: true,
        closeClass: 'modalClose',
        closeTitle: 'Close'
    };

    $.modal.impl = {
        opts: false,
        init: function(data, settings) {
            this.opts = $.extend({},
                $.modal.defaults,
                settings
            );

            this.createOverlay();
            this.createContainer(data);
            this.bindEvents();
        },
        createOverlay: function() {
            if(!overlay) {
                overlay = $('<div></div>')
                    .attr('id', this.opts.overlayId)
                    .css({opacity: this.opts.overlay/100})
                    .hide()
                    .appendTo('body');
            }
        },
        createContainer: function(data) {
            if(!container) {
                var close = this.opts.close ? '<a class="'+this.opts.closeClass+'" title="'+this.opts.closeTitle+'"/>' : '';
                container = $('<div></div>')
                    .attr('id', this.opts.containerId)
                    .append(close)
                    .hide()
                    .appendTo('body');

                if($.browser.msie && ($.browser.version < 7)) {
                    this.fixIE();
                }

                overlay.show();

                // data could be a jQuery object or a string
                if(typeof data === "string") {
                    container.html(data);
                }
                else if(data.jquery) {
                    data.show().appendTo(container);
                }

                container.show();
            }
        },
        bindEvents: function() {
            //container.click(this.close);
            $('a.'+this.opts.closeClass).click(this.close);
        },
        fixIE: function() {
            // fix lack of <=IE6 support for CSS position:fixed
            overlay.css({position: 'absolute'});

            // fix z-index issue with select boxes
            $('<iframe src="javascript:false;"></iframe>')
                .addClass('modalIframe')
                .css({opacity: 0})
                .appendTo('body');
        },
        close: function() {
            container.hide().remove();
            overlay.hide().remove();

            container = null;
            overlay = null;

            if($.browser.msie && ($.browser.version < 7)) {
                $('iframe.modalIframe').remove();
            }

        }
    };

})(jQuery);