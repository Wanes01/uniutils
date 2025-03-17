<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

if (!isUserLoggedIn()) {
    echo json_encode(array("success" => false));
    return;
}

session_unset();
session_destroy();

// set the cookie as expired
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

echo json_encode(array("success" => true));
?>