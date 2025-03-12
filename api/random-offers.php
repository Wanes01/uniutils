<?php
require_once '../bootstrap.php';
$discounted = $dbh->getRandomDiscountedProducts(4);

for($i = 0; $i < count($discounted); $i++){
    $discounted[$i]["image_name"] = PROD_DIR.$discounted[$i]["image_name"];
}
header('Content-Type: application/json');
echo json_encode($discounted);
?>