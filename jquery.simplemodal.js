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
    var content,
        container,
        overlay;

    $.fn.modal = function(settings) {
        $.modal.impl.init(this, settings);
    };

    $.modal = function(data, settings) {
        $.modal.impl.init(data, settings);
    };
    
    $.modal.close = function() {
        $.modal.impl.close();
    };

    $.modal.defaults = {
        overlay: 50, // opacity
        overlayId: 'modalOverlay',
        containerId: 'modalContainer',
        contentId: 'modalContent',
        close: true,
        closeClass: 'modalClose',
        closeTitle: 'Close',
        onShow: false
    };

    $.modal.impl = {
        /**
         * Place holder for the modal dialog options
         */
        opts: false,
        /**
         * Initialize the modal dialog
         * - Merge the default options with user defined options
         * - Call the functions to create the modal dialog
         * - Handle passed in onShow callback
         * - Bind known events
         */
        init: function(data, settings) {
            this.opts = $.extend({},
                $.modal.defaults,
                settings
            );
            if (overlay) {
                return false;
            }
            this.createOverlay();
            this.createContainer();
            this.addContent(data);
            if (this.opts.onShow) {
                this.opts.onShow(this);
            }
            this.bindEvents();
        },
        /**
         * Add the modal overlay to the page
         * - Set the overlay id and append to the page
         * - Set the opacity of the overlay
         * - Show the overlay
         */
        createOverlay: function() {
            overlay = $('<div></div>')
                .attr('id', this.opts.overlayId)
                .css({opacity: this.opts.overlay/100})
                .hide()
                .appendTo('body');
            overlay.show();
        },
        /**
         * Add the modal container to the page
         * - Set the container id and append to the page
         * - Perform IE fixes, if necessary
         * - Show the container and reset top position
         */
        createContainer: function() {
            container = $('<div></div>')
                .attr('id', this.opts.containerId)
                .append(this._closeLink())
                .hide()
                .appendTo('body');
            if ($.browser.msie && ($.browser.version < 7)) {
                this.fixIE();
            }
            container.show().css({top: this._containerTop()});
        },
        /**
         * Add the modal content data to the container
         * - Set the content id and append to the container
         * - Handle string data as well as jQuery element(s)
         * - Show the content
         */
        addContent: function(data) {
            content = $('<div></div>')
                .attr('id', this.opts.contentId)
                .appendTo(container);
            if (typeof data === "string") {
                content.append(data);
            }
            else if (data.jquery) {
                data.show().appendTo(content);
            }
            content.show();
        },
        bindEvents: function() {
            $('a.'+this.opts.closeClass).click(this.close);
        },
        /**
         * Fix issues in IE6
         * - Simulate position:fixed and make sure the overlay height is 100%
         * - Add an iframe to prevent select options from bleeding through
         */
        fixIE: function() {
            overlay.css({position: 'absolute', height: $(document).height()+'px'});
            $('<iframe src="javascript:false;"></iframe>')
                .addClass('modalIframe')
                .css({opacity: 0})
                .appendTo('body');
        },
        /**
         * Close the modal dialog
         * - Hides then removes the element from the DOM
         * - Sets modal vars to null
         * - Removes the IE iframe, if necessary
         */
        close: function() {
            container.hide().remove();
            overlay.hide().remove();
            content = container = overlay = null;
            if ($.browser.msie && ($.browser.version < 7)) {
                $('iframe.modalIframe').remove();
            }
        },
        /**
         * Builds the modal dialog 'close' link element
         * - Currently only returns an empty a element, depends on styling
         * - Returns an empty string if close is false
         */
        _closeLink: function() {
            return this.opts.close ? '<a class="'+this.opts.closeClass+'" title="'+this.opts.closeTitle+'"/>' : '';
        },
        /**
         * Determines the top value for the modal container
         * - Forces the modal dialog to always display in the viewable port
         * - Warning: if a top value is not defined in the CSS, the container
         *            will be displayed at the very bottom of the page
         */
        _containerTop: function() {
            var topOffset = 0;
            if (document.documentElement && document.documentElement.scrollTop) {
                topOffset = document.documentElement.scrollTop;
            }
            else if (document.body) {
                topOffset = document.body.scrollTop;
            }
            var currentOffset = container.offset();
            return (topOffset + currentOffset.top) + 'px';
        }
    };

})(jQuery);