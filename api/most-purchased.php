<?php
require_once '../bootstrap.php';

if (isset($_GET["quantity"])) {
    $mostPurchaed = $dbh->getMostPurchasedProducts($_GET["quantity"]);
} else {
    $mostPurchaed = $dbh->getMostPurchasedProducts();
}

for($i = 0; $i < count($mostPurchaed); $i++){
    $mostPurchaed[$i]["image_name"] = PROD_DIR.$mostPurchaed[$i]["image_name"];
}
header('Content-Type: application/json');
echo json_encode($mostPurchaed);
?>