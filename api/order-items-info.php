<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

// only the orders owner and the vendor can see the order items
if (!isUserLoggedIn()) {
    echo json_encode(array("success" => false));
    return;
}

$items = $dbh->getOrderItemAndProductData($_GET["id"]);
echo json_encode($items);
?>