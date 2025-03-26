<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

// only the orders owner and the vendor can see the orders
if (!isUserLoggedIn()) {
    echo json_encode(array("success" => false));
    return;
}

// a customer can see only his own orders, the vendor can see all of them
$orders = isUserCustomer()
    ? $dbh->getOrders($_SESSION["userId"])
    : $dbh->getOrders();

echo json_encode($orders);
?>