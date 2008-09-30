CONTENTS OF THIS FILE
----------------------

	* Introduction
	* Requirements
	* Installation
	* Adding SMCF Functionality to your site


INTRODUCTION
------------
Maintainer:
	Eric Martin (http://drupal.org/user/368225)

Licensed under the GNU/GPL License

SimpleModal Contact Form (SMCF) is an Ajax powered modal contact form. 

It utilizes the jQuery JavaScript library and the SimpleModal jQuery plugin.

SMCF has options to include the jQuery and SimpleModal files as well as
whether to include certain contact form elements, like a Subject field and
"Send me a copy" option for the sender.

This module will include the CSS and JS files in your Drupal Installation
without the need to edit your theme.

REQUIREMENTS
------------
	* PHP mail()
	* jQuery 1.2 or greater

INSTALLATION
------------
1. Copy smcf folder to modules directory.
2. At admin/build/modules enable the SMCF module.
3. Enable permissions at admin/user/permissions.
4. Configure the module at admin/settings/smcf.
5. See "Adding SMCF Functionality to your site".


ADDING SMCF FUNCTIONALITY TO YOUR SITE
--------------------------------------------

After you've installed, enabled and configured SMCF, you still need to 
integrate it into your site. There are two ways to make this happen:

1. Add the class "smcf-link" to any element that you want to open 
SMCF (when clicked).
For example: <a href="/contact" class="smcf-link">Contact</a>

2. On the SMCF settings page, under Drupal Menu ID, enter the numeric ID
for the menu item that you want SMCF to attach to (Do not include menu-).
For example, if your theme produces:
<ul class="links primary-links">
  <li class="menu-112 first"><a title="Contact" href="/drupal/node/1">Contact</a></li>
</ul>

You would enter 112 under Drupal Menu ID.