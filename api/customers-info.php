<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

// only the vendor can see the customers data
if (!isUserLoggedIn() || isUserCustomer()) {
    echo json_encode(array("success" => false));
    return;
}

$customers = $dbh->getCustomers();
echo json_encode($customers);
?>