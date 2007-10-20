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
		$('.modalCloseImg').hide();
		dialog.overlay.fadeIn('slow', function () {
			dialog.container.show('slow', function () {
				dialog.content.fadeIn('slow');
			});
		});
	},
	show: function (dialog) {
		$('#contactModalContainer #submit').click(function (e) {
			e.preventDefault();
			$('#contactModalContainer .loading').show();
			$('#contactModalContainer #submit').attr('disabled', 'disabled');
			$.ajax({
				url: 'data/contact.php',
				data: 'action=send',
				dataType: 'html',
				complete: function (xhr) {
					$('#contactModalContainer form').fadeOut('slow', function () {
						$('#contactModalContainer').animate({
							height: '100px'
						}, function () {
							$('#contactModalContainer .loading').hide();
							$('#contactModalContainer .message').html(xhr.responseText).show();	
							$('.modalCloseImg').fadeIn();
						});						
					})
				},
				error: contact.error
			});
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