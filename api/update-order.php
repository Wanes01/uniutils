<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

// only the vendor can update the orders
if (!isUserLoggedIn() || isUserCustomer()) {
    echo json_encode(array("success" => false));
    return;
}

error_log(var_export($_POST, true));

// a customer can see only his own orders, the vendor can see all of them
$dbh->updateOrder(
    $_POST["orderID"],
    $_POST["status"],
    $_POST["deliveryDate"] == "" ? null : $_POST["deliveryDate"]);

echo json_encode(array("success" => true));
?>