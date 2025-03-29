<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

// Only logged in users can send notifications
if (!isUserLoggedIn()) {
    echo json_encode(array("success" => false));
    return;
}

$recipient = $_POST["user"]; // the user ID. Special value "all" to reach all customers (can only be done by the vendor)
$title = $_POST["title"];
$message = $_POST["message"];

$errors = validateNotificationData($title, $message);

if (count($errors) > 0) {
    echo json_encode($errors);
    return;
}

// no errors occurred. The notification can be sent
if (isUserCustomer()) {
    // customers can only send notifications to the vendor
    $title = "[" . $_SESSION["username"] . " | ID: " . $_SESSION["userId"] . "] " . $title;
    $dbh->sendNotification($title, $message, VENDOR_ID);
} else {
    $title = "[Messaggio dal venditore] " . $title;
    // vendor can send notifications to single customers or all of them
    $recipient === "all"
        ? $dbh->sendNotification($title, $message)
        : $dbh->sendNotification($title, $message, $recipient);
}

echo json_encode($errors);

?>