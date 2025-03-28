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

// Notifies the vendor about the order
$dbh->sendNotification(
    "E' stato avviato un nuovo ordine (n. " . $orderID . ")",
    "E' stato avviato un nuovo ordine dal valore di €" . $totalPrice . " in data " . formatDateIt(explode(" ", $purchaseDate)[0]) . ".",
    VENDOR_ID
);

echo json_encode(array("success" => true));
?>