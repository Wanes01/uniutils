<?php
require_once '../bootstrap.php';
$mostPurchaed = $dbh->getMostPurchasedProducts(4);

for($i = 0; $i < count($mostPurchaed); $i++){
    $mostPurchaed[$i]["image_name"] = PROD_DIR.$mostPurchaed[$i]["image_name"];
}
header('Content-Type: application/json');
echo json_encode($mostPurchaed);
?>