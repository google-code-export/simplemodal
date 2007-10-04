/**
 * SimpleModal Test
 * http://code.google.com/p/simplemodal/
 *
 * Copyright (c) 2007 Eric Martin - http://ericmmartin.com
 *
 * Revision: $Id$
 *
 */
$(function(){
    $('a.modalFunction').click(function(e){
        e.preventDefault();
        $('#modalContent').modal(); 
    });
    $('a.modalStatic').click(function(e){
        e.preventDefault();
        var content = $('<div>content</div>');
        $.modal(content, {overlay:'90'});
    });
});