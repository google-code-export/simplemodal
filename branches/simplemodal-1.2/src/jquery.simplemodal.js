(function () {
   
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

})(jQuery);
