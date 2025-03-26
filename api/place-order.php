<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

if (!isUserLoggedIn()) {
    echo json_encode(array("success" => false));
    return;
}

// creates the order
$totalPrice = computeCartPrice($_SESSION["userId"], $dbh);
$purchaseDate = date("Y-m-d H:i:s", time());
$orderID = $dbh->placeOrder($_SESSION["userId"], $purchaseDate, $totalPrice);

// changes the cart items to order items
$dbh->copyFromCartToOrder($_SESSION["userId"], $orderID);

// empties the user's cart
$dbh->emptyCart($_SESSION["userId"]);

echo json_encode(array("success" => true));
?>