<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

// only the user can mark as read his own notificatios
if (!isUserLoggedIn() || !isset($_GET["id"])) {
    echo json_encode(array("success" => false));
    return;
}

$dbh->deleteNotification($_SESSION["userId"], $_GET["id"]);

echo json_encode(array("success" => true));
?>