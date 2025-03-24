<?php
require_once '../bootstrap.php';

// only the cart owner and the vendor can see the cart
if (!isUserLoggedIn() || $_SESSION["userId"] != $_GET["id"]) {
    return json_encode(array("success" => false));
}

$cart = $dbh->getUserCart($_GET["id"]);
header('Content-Type: application/json');
echo json_encode($cart);
?>