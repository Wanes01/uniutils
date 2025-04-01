<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');
if (!isUserLoggedIn()) {
    echo json_encode(array("count" => 0));
    return;
}

$count = $dbh->countNotifications($_SESSION["userId"]);
echo json_encode($count);
?>