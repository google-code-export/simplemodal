/*
 * SimpleModal Contact Form
 * http://www.ericmmartin.com/projects/simplemodal/
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

$(document).ready(function () {
	$('#contactForm input:eq(0)').click(function (e) {
		e.preventDefault();
		// load the contact form using ajax
		$.get("data/contact.php", function(data){
			// create a modal dialog with the data
			$(data).modal({
				close: false,
				overlayId: 'contactModalOverlay',
				containerId: 'contactModalContainer',
				iframeId: 'contactModalIframe',
				onOpen: contact.open,
				onShow: contact.show,
				onClose: contact.close
			});
		});
	});
});

var contact = {
	message: null,
	open: function (dialog) {
		dialog.overlay.fadeIn(200, function () {
			dialog.container.fadeIn(200, function () {
				dialog.data.fadeIn(200, function () {
					$('#contactModalContainer #name').focus();
				});
				// resize the textarea for safari
				if ($.browser.safari) {
					$('#contactModalContainer textarea').attr({
						cols: '37',
						rows: '8'
					});
				}
			});
		});
	},
	show: function (dialog) {
		$('#contactModalContainer .send').click(function (e) {
			e.preventDefault();
			// validate form
			if (contact.validate()) {
				$('#contactModalContainer .message').fadeOut(function () {
					$('#contactModalContainer .message').removeClass('error').empty();
				});
				$('#contactModalContainer .title').html('Sending...');
				$('#contactModalContainer form').fadeOut(200);
				$('#contactModalContainer .content').animate({
					height: '80px'
				}, function () {
					$('#contactModalContainer .loading').fadeIn(200, function () {
						$.ajax({
							url: 'data/contact.php',
							data: $('#contactModalContainer form').serialize() + '&action=send',
							dataType: 'html',
							complete: function (xhr) {
								$('#contactModalContainer .loading').fadeOut(200, function () {
									$('#contactModalContainer .title').html('Thank you!');
									$('#contactModalContainer .message').html(xhr.responseText).fadeIn(200);
								});
							},
							error: contact.error
						});
					});
				});
			}
			else {
				if ($('#contactModalContainer .message:visible').length > 0) {
					$('#contactModalContainer .message div').fadeOut(200, function () {
						$('#contactModalContainer .message div').empty();
						contact.showError();
						$('#contactModalContainer .message div').fadeIn(200);
					});
				}
				else {
					$('#contactModalContainer .message').animate({
						height: '30px'
					}, contact.showError);
				}
				
			}
		});
	},
	close: function (dialog) {
		dialog.data.fadeOut(200, function () {
			dialog.container.fadeOut(200, function () {
				dialog.overlay.fadeOut(200, function () {
					$.modal.close();
				});
			});
		});
	},
	error: function (xhr) {
		alert(xhr.statusText);
	},
	validate: function () {
		contact.message = '';
		if (!$('#contactModalContainer #name').val()) {
			contact.message += 'Name is required. ';
		}

		var email = $('#contactModalContainer #email').val();
		if (!email) {
			contact.message += 'Email is required. ';
		}
		else {
			// Regex from: http://regexlib.com/REDetails.aspx?regexp_id=599
			var filter = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\w]*[0-9a-zA-Z])*\.)+[a-zA-Z]{2,9})$/;
			if (!filter.test(email)) {
				contact.message += 'Email is invalid. ';
			}
		}

		if (!$('#contactModalContainer #message').val()) {
			contact.message += 'Message is required.';
		}

		if (contact.message.length > 0) {
			return false;
		}
		else {
			return true;
		}
	},
	showError: function () {
		$('#contactModalContainer .message').html($('<div class="error"></div>').append(contact.message)).fadeIn(200);
	}
};