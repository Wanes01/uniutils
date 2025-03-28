<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');
// a cart can be modified by the customer or the vendor only
if (!isUserLoggedIn()) {
    echo json_encode(array("success" => false));
    return;
}

$action = $_POST["action"];
$cart = $dbh->getUserCart($_SESSION["userId"]);

if ($action == "add") {
    // user may add the same product multiple times
    $alreadyAdded = false;
    foreach ($cart as $product) {
        if ($product["product_id"] == $_POST["productID"]) {
            $alreadyAdded = true;
            break;
        }
    }
    
    !$alreadyAdded
        ? $dbh->addProductToCart($_SESSION["userId"], $_POST["productID"], $_POST["purchaseQuantity"]) // adds the product to the user cart
        : $dbh->addQuantityToProductInCart($_SESSION["userId"], $_POST["productID"], $_POST["purchaseQuantity"]); // updates the quantity in the cart
    
    // updates the product total quantity
    $dbh->changeProductQuantity($_POST["productID"], $_POST["purchaseQuantity"]);

    // if the product is out of stock then notifies the vendor
    $product = $dbh->getProductByID($_POST["productID"])[0];
    if ($product["quantity_available"] == 0) {
        $dbh->sendNotification(
            'Scorte esaurite di "' . $product["title"] . '"',
            'Hai esaurito completamente le scorte di "' . $product["title"] . '". Per i clienti non sará piú possibile visualizzare e/o comprare il prodotto nel catalogo finché il numero di scorte disponibili non verrá aggiornato.',
            VENDOR_ID
        );
    }

} else if ($action == "deleteFromCart") {
    // get the product quantity in the cart
    foreach ($cart as $product) {
        if ($product["product_id"] == $_POST["productID"]) {
            $quantity = $product["quantity"];
            break;
        }
    }
    // updates the product quantity
    $dbh->changeProductQuantity($_POST["productID"], $quantity, false);
    // removes the product from the cart
    $dbh->removeProductFromCart($_SESSION["userId"], $_POST["productID"]);
}

echo json_encode(array("success" => true));
?>