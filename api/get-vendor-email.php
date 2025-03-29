<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

$vendor = $dbh->getUserById(VENDOR_ID);
echo json_encode(array("email" => $vendor["email"]));
?>