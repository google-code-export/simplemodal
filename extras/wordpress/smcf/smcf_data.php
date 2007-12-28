<?php

require_once('../../../wp-config.php');

define ("SMCF_DIR", "/wp-content/plugins/smcf");

// Process
$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';
if (empty($action)) {
	// do nothing
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
	$to = get_option('smcf_to_email');
	$subject = get_option('smcf_subject');

	// Filter name
	$name = filter($name);

	// Filter and validate email
	$email = filter($email);
	if (!validEmail($email)) {
		$subject .= " - invalid email";
		$message .= "\n\nBad email: $email";
		$email = $to;
	}

	// Add additional info to the message
	if (get_option('smcf_ip')) {
		$message .= "\n\nIP: " . $_SERVER['REMOTE_ADDR'];
	}
	if (get_option('smcf_ua')) {
		$message .= "\n\nUSER AGENT: " . $_SERVER['HTTP_USER_AGENT'];
	}

	// Set and wordwrap message body
	$body = "From: $name\n\n";
	$body .= "Message: $message";
	$body = wordwrap($body, 70);

	// Build header
	$header = "From: $email\n";
	$header .= "X-Mailer: PHP/SimpleModal";

	// Send email
	mail($to, $subject, $body, $header) or 
		die('Unfortunately, your message could not be delivered.');
}

// Remove any un-safe values to prevent email injection
function filter($value) {
	$pattern = array("/\n/","/\r/","/content-type:/i","/to:/i", "/from:/i", "/cc:/i");
	$value = preg_replace($pattern, '', $value);
	return $value;
}

// Validate email address format in case client-side validation "fails"
function validEmail($email) {
	// Borrowed from http://www.php.net/manual/en/function.eregi.php#52458

	// Allowed characters for part before "at" character
	$atom = '[-a-z0-9!#$%&\'*+/=?^_`{|}~]';

	// Allowed characters for part after "at" character
	$domain = '([a-z]([-a-z0-9]*[a-z0-9]+)?)'; 

	$regex = '^' . $atom . '+' .	// One or more atom characters.
	'(\.' . $atom . '+)*' .			// Followed by zero or more dot separated sets of one or more atom characters
	'@' .							// Followed by an "at" character.
	'(' . $domain . '{1,63}\.)+' .	// Followed by one or max 63 domain characters (dot separated).
	$domain . '{2,63}' .			// Must be followed by one set consisting a period of two
	'$'; 
	if (eregi($regex, $email)) {
		return true;
	} else {
		return false;
	}
}

exit;

?>