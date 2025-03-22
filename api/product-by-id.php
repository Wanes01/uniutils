<?php
require_once '../bootstrap.php';

header('Content-Type: application/json');

if (!isset($_GET["id"])) {
    echo json_encode(array("success" => false));
    return;
}

$id = $_GET["id"];
$product = $dbh->getProductByID($id)[0];
$product["category_ids"] = explode(", ", $product["category_ids"]);

echo json_encode(array("success" => true, "product" => $product));
?>