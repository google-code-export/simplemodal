/*
 * SimpleModal Confirm Modal Dialog
 * http://www.ericmmartin.com/projects/simplemodal/
 * http://code.google.com/p/simplemodal/
 *
 * Copyright (c) 2008 Eric Martin - http://ericmmartin.com
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Revision: $Id$
 *
 */

$(document).ready(function () {
	$('#confirmDialog input:eq(0)').click(function (e) {
		e.preventDefault();

		// example of calling the confirm function
		// you must use a callback function to perform the "yes" action
		confirm("Continue to the SimpleModal Project page?", function () {
			window.location.href = 'http://www.ericmmartin.com/projects/simplemodal/';
		});
	});
});

function confirm(message, callback) {
	$('#confirm').modal({
		close: false, 
		overlayId: 'confirm-overlay',
		overlayCss: {background: '#eee', cursor: 'wait'},
		containerId: 'confirm-container',
		containerCss: {
			background: '#fff',
			border: '2px solid #336699',
			fontFamily: '"Trebuchet MS", Verdana, Arial',
			fontSize: '16px',
			height: '140px',
			textAlign: 'left',
			width: '420px'
		},
		onShow: function (dialog) {
			dialog.data.find('.message').append(message);

			// if the user clicks "yes"
			dialog.data.find('.yes').click(function () {
				// call the callback
				if ($.isFunction(callback)) {
					callback.apply();
				}
				// close the dialog
				dialog.close();
			});
		}
	});
}