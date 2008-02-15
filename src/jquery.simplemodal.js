(function ($) {

   $.extend($.fn, {
      modal: function (options) {
         return $.modal.impl.init(this, options);
      }
   });

   $.modal = function (content, options) {
      return $.modal.impl.init(content, options);
   };
      
   $.modal.close = function (id) {
      $.modal.impl.close(id);
   };
   
   $.modal.zIndex = 500;
   
   $.modal.defaults = {
      /* Properties */
      overlayId: null,
      containerId: null,
      dataId: null,
      overlayCss: {
         opacity: .5,
         height: '100%',
         width: '100%',
         position: 'fixed',
         left: 0,
         top: 0,
         backgroundColor: '#000',
         cursor: 'wait'
      },
      containerCss: {
         position: 'fixed',
         top: '15%',
         height: '400px',
         left: '50%',
         width: '600px',
         marginLeft: '-300px',
         backgroundColor: '#fff',
         border: '3px solid #ccc'
      },
      showTitle: true,
      title: 'Dialog',
      titleBarCss: {},
      showClose: true,
      close: 'X',
      closeCss: {},
      dataCss: {
         width: '100%',
         height: '100%',
         overflow: 'auto'
      },
      contentCss: {},
      persist: false,
      /* Callback functions */
      onOpen: null,
      onShow: null,
      onClose: null
   };
   
   $.modal.impl = {
      guid: 1,
      init: function (content, options) {
         new dialog(this.guid, content, options);
         this.guid++;
      },
      close: function (id) {
         // if an id is passed, find all of the elements related to that id
         
         // otherwise, find all simplemodal dialogs and 
         // close the one with the highest id
         
         
      }
   };
   
   var dialog = function (guid, content, options) {
      this.guid = guid;
      
      // extend the options object
      this.options = $.extend({}, $.modal.defaults, options);
      
      // now make sure we correctly extend the specific css objects
      if (options != undefined) {
         this.options.overlayCss = $.extend({}, $.modal.defaults.overlayCss, options.overlayCss);
         this.options.containerCss = $.extend({}, $.modal.defaults.containerCss, options.containerCss);
         this.options.dataCss = $.extend({}, $.modal.defaults.dataCss, options.dataCss);
      }
      
      // initialize dialog
      this.init(content);
   };
   
   dialog.prototype = {
      guid: null,
      options: {},
      data: null,
      container: null,
      overlay: null,
      iframe: null,
      parentNode: null,
      original: null,
      init: function (content) {
         // create the overlay, container, and add the content
         // if IE < 7, add an iframe and fix IE problems
         this.create(content);

         // display the modal dialog
         // calls the onOpen callback, if provided
         this.open();

         // bind default events
         this.bindEvents();

         // useful for adding events/manipulating content in the modal dialog
         if ($.isFunction(this.options.onShow)) {
            this.options.onShow.apply(this, [this]);
         }
         
         // maintain the chain - catchy, huh? =)
         return this;
      },
      create: function (content) {
         // create overlay
         this.options.overlayId = this.options.overlayId || 'simplemodal-overlay-' + this.guid;
         this.overlay = $('<div/>')
            .attr({id: this.options.overlayId})
            .addClass('simplemodal-overlay')
            .css($.extend(this.options.overlayCss, {zIndex: $.modal.zIndex++}))
            .hide()
            .appendTo('body');

         // create container
         this.options.containerId = this.options.containerId || 'simplemodal-container-' + this.guid;         
         this.container = $('<div/>')
            .attr({id: this.options.containerId})
            .addClass('simplemodal-container')
            .css($.extend(this.options.containerCss, {zIndex: $.modal.zIndex++}))
            .hide()
            .appendTo('body');

         // create title bar
         var titleBar = $('<div/>').addClass('simplemodal-titlebar');
         if (this.options.showTitle) {
            titleBar.append($('<span/>')
               .addClass('simplemodal-title')
               .css(this.options.titleBarCss)
               .html(this.options.title));
         }
         
         if (this.options.close) {
            titleBar.append($('<span/>')
               .addClass('simplemodal-close simplemodal-close-x')
               .css(this.options.closeCss)
               .html(this.options.title));
         }
            
            
            
            this.container.append(
               $('<a/>')
                  .attr('href', '#')
                  .addClass('simplemodal-close simplemodal-close-image')
                  .css(this.options.closeImageCss)
                  .html('test')
            );
         }

         // create data
         this.options.dataId = this.options.dataId || 'simplemodal-data-' + this.guid;         
         this.data = $('<div/>')
            .attr({id: this.options.dataId})
            .addClass('simplemodal-data')
            .css(this.options.dataCss);

         // determine how to handle the content based on its type
         if (typeof content == 'object') {
            // convert DOM object to a jQuery object
            content = content instanceof jQuery ? content : $(content);

            // if the object came from the DOM, keep track of its parent
            if (content.parent().parent().size() > 0) {
               this.parentNode = content.parent();

               // persist changes? if not, make a clone of the element
               if (!this.options.persist) {
                  this.original = content.clone(true);
               }
            }
            content.show(); // make sure the content is visible
         }
         else if (typeof content == 'string' || typeof content == 'number') {
            // just wrap the content in a div, for safety =)
            //content = $('<div/>').html(content);
         }
         else {
            // unsupported data type!
            //alert('SimpleModal Error: Unsupported data type: ' + typeof content);
            return false;
         }
         this.data.append(content);
         
         this.container.append(this.data.hide());
      },
      open: function () {
         // display the iframe
         if (this.iframe) {
            this.iframe.show();
         }

         if ($.isFunction(this.options.onOpen)) {
            // execute the onOpen callback 
            this.options.onOpen.apply(this, [this]);
         }
         else {
            // display the remaining elements
            this.overlay.show();
            this.container.show();
            this.data.show();
         }
      },
      close: function (internal) {
         // prevent close when dialog does not exist
         if (!this.data) {
            return false;
         }
         
         if ($.isFunction(this.options.onClose) && internal) {
            // execute the onClose callback
            this.options.onClose.apply(this, [this]);
         }
         else {
            // if the data came from the DOM, put it back
            if (this.parentNode) {
               // save changes to the data?
               if (this.options.persist) {
                  // insert the (possibly) modified data back into the DOM
                  this.data.hide().appendTo(this.parentNode);
               }
               else {
                  // remove the current and insert the original, 
                  // unmodified data back into the DOM
                  this.data.remove();
                  this.original.appendTo(this.parentNode);
               }
            }
            else {
               // otherwise, remove it
               this.data.remove();
            }

            // remove the remaining elements
            this.container.remove();
            this.overlay.remove();
            if (this.iframe) {
               this.iframe.remove();
            }
         }      
      },
      bindEvents: function () {
         var dialog = this;
         this.container
            .find('.simplemodal-close')
            .one('click.simplemodal-' + this.guid, function (e) {
               e.preventDefault();
               dialog.close(true); // true = internal call
            });
      }
   };
})(jQuery);