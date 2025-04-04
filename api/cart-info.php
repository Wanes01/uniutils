<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

// only the cart owner and the vendor can see the cart
if (!isUserLoggedIn()) {
    echo json_encode(array("success" => false));
    return;
}

$cart = $dbh->getUserCart($_SESSION["userId"]);
echo json_encode($cart);
?>