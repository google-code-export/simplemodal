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
	$('#contactForm input[name="contact"]').click(function (e) {
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
		dialog.overlay.fadeIn(500, function () {
			dialog.container.show(500, function () {
				dialog.content.fadeIn(500, function () {
					$('#contactModalContainer #name').focus();
				});
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
				$('#contactModalContainer form').fadeOut();
				$('#contactModalContainer .content').animate({
					height: '80px'
				}, function () {
					$('#contactModalContainer .loading').fadeIn(function () {
						$.ajax({
							url: 'data/contact.php',
							data: $('#contactModalContainer form').serialize() + '&action=send',
							dataType: 'html',
							complete: function (xhr) {
								$('#contactModalContainer .loading').fadeOut(function () {
									$('#contactModalContainer .title').html('Thank you!');
									$('#contactModalContainer .message').html(xhr.responseText).fadeIn();
								});
							},
							error: contact.error
						});
					});
				});
			}
			else {
				$('#contactModalContainer .message').animate({
					height: '30px'
				}, function () {
					$('#contactModalContainer .message').html($('<div class="error"></div>').append(contact.message)).fadeIn(500);
				});
				
			}
		});
	},
	close: function (dialog) {
		dialog.content.fadeOut(500, function () {
			dialog.container.hide(500, function () {
				dialog.overlay.fadeOut(500, function () {
					$.modal.remove(dialog);
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

		if (!$('#contactModalContainer #email').val()) {
			contact.message += 'Email is required. ';
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
	}
};