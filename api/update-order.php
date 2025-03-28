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

// notify the user about the order status change.
$title = "Aggiornamento dal tuo ordine (n. " . $_POST["orderID"] . ")";
$message = "Il tuo ordine ha appena cambiato stato! Il nuovo stato del tuo ordine é " . $_POST["status"] . ".";
$message .= $_POST["deliveryDate"] != "" ? "\nLa data di consegna stimata é " . formatDateIt($_POST["deliveryDate"]) . "." : "";
$userID = $dbh->getUserByOrder($_POST["orderID"]);

$dbh->sendNotification($title, $message, $userID);

echo json_encode(array("success" => true));
?>