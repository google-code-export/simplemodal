<?php
// $Id$

/**
 * @file
 * Administrative page callbacks for the SMCF module.
 */

/**
 * The default SMCF settings page.
 */
function smcf_settings_page($op = NULL) {
	$output = drupal_get_form('smcf_general_settings_form');
	return $output;
}

/**
 * General configuration form for controlling the contact form behaviour.
 */
function smcf_general_settings_form() {
	$form['javascript_fieldset'] = array(
		'#type' => 'fieldset',
		'#title' => t('JavaScript Settings'),
		'#collapsible' => TRUE,
		'#collapsed' => FALSE
	);
	// Add checkbox for simplemodal js.
	$form['javascript_fieldset']['smcf_simplemodal_js'] = array(
		'#type' => 'checkbox',
		'#title' => t('Include SimpleModal'),
		'#description' => t('Select this option if you do not already have the SimpleModal JavaScript file included in your site.'),
		'#default_value' => variable_get('smcf_simplemodal_js', TRUE)
	);
	// Add radio buttons for the location to insert the JavaScript files
	$page_options = array(
		'header' => t('Header'),
		'footer' => t('Footer'),
	);
	$form['javascript_fieldset']['smcf_js_location'] = array(
		'#type' => 'radios',
		'#options' => $page_options,
		'#title' => t('Insert SimpleModal JavaScript files in the header or footer. Footer is the recommended choice.'),
		'#default_value' => variable_get('smcf_js_location', 'footer'),
	);

	$form['contact_form_fieldset'] = array(
		'#type' => 'fieldset',
		'#title' => t('Contact Form Options'),
		'#collapsible' => TRUE,
		'#collapsed' => FALSE
	);
	// Add field for the form title.
	$form['contact_form_fieldset']['smcf_form_title'] = array(
		'#type' => 'textfield',
		'#title' => t('Form Title'),
		'#description' => t('Enter the title that you want displayed on your contact form. Examples: "Contact Me", "Send Me A Message", etc. <b>Default:</b> Contact Me'),
		'#default_value' => variable_get('smcf_form_title', 'Contact Me')
	);
	// Add checkbox for option to include a subject field.
	$form['contact_form_fieldset']['smcf_form_subject'] = array(
		'#type' => 'checkbox',
		'#title' => t('Include Subject Field'),
		'#description' => t('Select this option if you would like the contact form to include a subject field. The field will not be required and if not entered, will use the "Form Subject" value from below.'),
		'#default_value' => variable_get('smcf_form_subject', TRUE)
	);
	// Add checkbox for option to include a cc/copy me field.
	$form['contact_form_fieldset']['smcf_form_cc_sender'] = array(
		'#type' => 'checkbox',
		'#title' => t('Include "Send me a copy" Option'),
		'#description' => t('Select this option if you would like the contact form to include a "Send me a copy" option for the sender.'),
		'#default_value' => variable_get('smcf_form_cc_sender', TRUE)
	);

	$form['email_fieldset'] = array(
		'#type' => 'fieldset',
		'#title' => t('Email Options'),
		'#collapsible' => TRUE,
		'#collapsed' => FALSE
	);
	// Add checkbox for option to include a subject field.
	$email = variable_get('site_mail', ini_get('sendmail_from'));
	$form['email_fieldset']['smcf_to_email'] = array(
		'#type' => 'checkbox',
		'#title' => t('Form To'),
		'#description' => t('Enter the email address that you want all contact emails to be sent to. <b>Default:</b> The Drupal site_mail variable or php.ini sendmail_from variable.'),
		'#default_value' => variable_get('smcf_to_email', $email)
	);
	// Add checkbox for option to include a cc/copy me field.
	$subject = $email = variable_get('site_name', 'SimpleModal') . ' Contact Form';
	$form['email_fieldset']['smcf_subject'] = array(
		'#type' => 'checkbox',
		'#title' => t('Form Subject'),
		'#description' => t('Enter the default subject that you want all contact emails to be sent with. This value will be used if you do not enable the subject field or if you do enable the subject field, but the user does not enter a subject. <b>Default:</b> The Drupal site_name variable or SimpleModal plus "Contact Form".'),
		'#default_value' => variable_get('smcf_subject', $subject)
	);
	// Add checkbox for option to include a subject field.
	$form['email_fieldset']['smcf_ip'] = array(
		'#type' => 'checkbox',
		'#title' => t('Include the users IP Address'),
		'#description' => t('Select this option if you would like the contact form email to include the users IP Address. <b>Note:</b> The sender will also see this value if the "Send me a copy" option is enabled and selected'),
		'#default_value' => variable_get('smcf_ip', FALSE)
	);
	// Add checkbox for option to include a cc/copy me field.
	$form['email_fieldset']['smcf_ua'] = array(
		'#type' => 'checkbox',
		'#title' => t('Include the users User Agent'),
		'#description' => t('Select this option if you would like the contact form email to include the users User Agent. <b>Note:</b> The sender will also see this value if the "Send me a copy" option is enabled and selected.'),
		'#default_value' => variable_get('smcf_ua', FALSE)
	);

	return system_settings_form($form);
}

/**
 * Validation function for the general configuration form.
 *
 * Validate the Form To value. It is required and must be a valid
 * email address.
 */
function smcf_general_settings_form_validate($form, &$form_state) {
	$email = $form_state['values']['smcf_to_email'];
	if (empty($email)) {
		form_set_error('smcf_to_email', t('You must enter a value.'));
	}
	else {
		if (!valid_email_address($email)) {
			form_set_error('smcf_to_email', t('You must enter a value email address.'));
		}
	}
}