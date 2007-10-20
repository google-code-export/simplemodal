$(document).ready(function () {
	$('#contactDemo').click(function (e) {
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
	open: function (dialog) {
		dialog.overlay.fadeIn('slow', function () {
			dialog.container.slideDown('slow', function () {
				dialog.content.fadeIn('slow');
			});
		});
	},
	show: function (dialog) {
		$('#contactModalContainer #submit').click(function (e) {
			e.preventDefault();
			$('#contactModalContainer .loading').show();
			$('#contactModalContainer #submit').attr(disabled, 'disabled');
			$.ajax({
				url: 'data/contact.php',
				data: 'test',
				dataType: 'html',
				complete: function (xhr) {
					$('#contactForm .message').html(xhr.responseText).show();
					$('#contactForm .loading').hide();
				},
				error: contact.error
			});
		});
	},
	close: function (dialog) {
		dialog.content.fadeOut('slow', function () {
			dialog.container.slideUp('slow', function () {
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