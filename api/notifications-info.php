<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

// only logged in users can have notifications
if (!isUserLoggedIn()) {
    echo json_encode(array("success" => false));
    return;
}

$notifications = $dbh->getUserNotifications($_SESSION["userId"]);
echo json_encode($notifications);
?>