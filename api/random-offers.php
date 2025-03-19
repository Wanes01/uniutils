<?php
require_once '../bootstrap.php';

if (isset($_GET["quantity"])) {
    $discounted = $dbh->getRandomDiscountedProducts($_GET["quantity"]);
} else {
    $discounted = $dbh->getRandomDiscountedProducts();
}

for($i = 0; $i < count($discounted); $i++){
    $discounted[$i]["image_name"] = PROD_DIR.$discounted[$i]["image_name"];
}

header('Content-Type: application/json');
echo json_encode($discounted);
?>