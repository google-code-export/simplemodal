<?php

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

// Global settings
$to = 'user@domain.com';
$subject = 'SimpleModal Contact Form';

// Process
$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';
if (empty($action)) {
	// Send back the contact form HTML
	echo "<div id='contactForm' style='display:none'>
	<a href='#' title='Close' class='modalCloseX modalClose'>x</a>
	<div class='top'></div>
	<div class='content'>
		<h1 class='title'>Send us a message:</h1>
		<div class='loading' style='display:none'></div>
		<div class='message' style='display:none'></div>
		<form action='#'>
			<label for='name'>Name:</label>
			<input type='text' id='name' name='name' size='40' tabindex='1'/>
			<label for='email'>Email:</label>
			<input type='text' id='email' name='email' size='40' tabindex='2'/>
			<label for='message'>Message:</label>
			<textarea id='message' name='message' cols='30' rows='5' tabindex='3'></textarea>
			<br/>
			<label for='submit'>&nbsp;</label>
			<img src='img/contact/send.png' alt='Send' class='send' />
			<img src='img/contact/cancel.png' alt='Cancel' class='cancel modalClose' />
			<br/>
		</form>
	</div>
	<div class='bottom'></div>
</div>";
}
else if ($action == 'send') {
	// Send the email
	$name = isset($_REQUEST['name']) ? $_REQUEST['name'] : '';
	$email = isset($_REQUEST['email']) ? $_REQUEST['email'] : '';
	$message = isset($_REQUEST['message']) ? $_REQUEST['message'] : '';

	sendEmail($name, $email, $message);
	echo "Message successfully sent.";
}

// Validate and send email
function sendEmail($name, $email, $message) {
	global $to, $subject;

	// Filter name
	$name = filter($name);

	// Filter and validate email
	$email = filter($email);
	if (!validEmail($email)) {
		$subject .= " - invalid email";
		$message .= "\n\nBad email: $email";
		$email = $to;
	}

	// Set and wordwrap message body
	$body = "From:\n$name\n\n";
	$body .= "Message:\n$message";
	$body = wordwrap($body, 70);

	// Build header
	$header = "From: $email\n";
	$header .= "X-Mailer: PHP/SimpleModal";

	// Send email
	mail($to, $subject, $body, $header) or 
		die('Unfortunately, your message could not be delivered.');
}

// Remove any un-safe values
function filter($value) {
	$pattern = array("/\n/","/\r/","/content-type:/i","/to:/i", "/from:/i", "/cc:/i");
	$value = preg_replace($pattern, '', $value);
	return $value;
}

// Validate email address format
function validEmail($email) {
	// Borrowed from http://www.php.net/manual/en/function.eregi.php#52458

	// Allowed characters for part before "at" character
	$atom = '[-a-z0-9!#$%&\'*+/=?^_`{|}~]';

	// Allowed characters for part after "at" character
	$domain = '([a-z]([-a-z0-9]*[a-z0-9]+)?)'; 

	$regex = '^' . $atom . '+' .		 // One or more atom characters.
	'(\.' . $atom . '+)*' .			  // Followed by zero or more dot separated sets of one or more atom characters
	'@' .								// Followed by an "at" character.
	'(' . $domain . '{1,63}\.)+' .	   // Followed by one or max 63 domain characters (dot separated).
	$domain . '{2,63}' .				 // Must be followed by one set consisting a period of two
	'$'; 
	if (eregi($regex, $email)) {
		return true;
	} else {
		return false;
	}
}

exit;

?>