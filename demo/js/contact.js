$(document).ready(function () {
	$('#contactDemo').click(function (e) {
		e.preventDefault();
		// load the contact form using ajax
		$.get("data/contact.php", function(data){
			// create a modal dialog with the data
			$(data).modal({
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
	open: function (dialog) {
		dialog.overlay.fadeIn('slow', function () {
			dialog.container.show('slow', function () {
				dialog.content.fadeIn('slow');
			});
		});
	},
	show: function (dialog) {
		$('#contactModalContainer #submit').click(function (e) {
			e.preventDefault();
			//validate
			// if valid {
			$('#contactModalContainer .title').html('Sending...');
			$('#contactModalContainer form').fadeOut();
			$('#contactModalContainer .content').animate({
				height: '80px'
			}, function () {
				$('#contactModalContainer .loading').fadeIn(function () {
					$.ajax({
						url: 'data/contact.php',
						data: 'action=send',
						dataType: 'html',
						complete: function (xhr) {
							$('#contactModalContainer .loading').fadeOut(function () {
								$('#contactModalContainer .title').html('Thank you');
								$('#contactModalContainer .message').html(xhr.responseText).fadeIn();	
							});
						},
						error: contact.error
					});
				});
			});


			//$('#contactModalContainer #submit').attr('disabled', 'disabled');

			// else {
			//
		});
	},
	close: function (dialog) {
		dialog.content.fadeOut('slow', function () {
			dialog.container.hide('slow', function () {
				dialog.overlay.fadeOut('slow', function () {
					$.modal.remove(dialog);
				});
			});
		});
	},
	error: function (xhr) {
		alert(xhr.statusText);
	}
};