<?php

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

if (empty($action)) {
    echo "<div id='contactForm' style='display:none'>
  <h1>Contact Us</h1>
  <div class='loading' style='display:none'></div>
  <div class='message' style='display:none'></div>
  <form action='#'>
    <label for='name'>Name:</label>
    <input type='text' id='name' name='name' size='30'/>
    <label for='email'>Email:</label>
    <input type='text' id='email' name='email' size='40'/>
    <label for='message'>Message:</label>
    <textarea id='message' name='message' cols='30' rows='5'></textarea>
    <br/>
    <label for='submit'>&nbsp;</label>
    <input type='submit' id='submit' name='submit' value='Send'/>
    <input type='button' class='modalClose' value='Cancel'/>
  </form>
</div>";
}
else if ($action == 'send') {
    print 'Message successfully sent.';
}
exit;

?>