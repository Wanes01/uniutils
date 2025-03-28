<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

// only the user can mark as read his own notificatios
if (!isUserLoggedIn() || !isset($_GET["op"])) {
    echo json_encode(array("success" => false));
    return;
}

$_GET["op"] == "read"
    ? $dbh->readAllNotifications($_SESSION["userId"])
    : $dbh->deleteAllNotifications($_SESSION["userId"]);

echo json_encode(array("success" => true));

?>