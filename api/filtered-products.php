<?php
require_once '../bootstrap.php';

$filterOptions = array();

// the following fields are mandatory in the request:
$filterOptions["minPrice"] = strlen($_GET["minPrice"]) != 0 ? $_GET["minPrice"] : 0;
$filterOptions["maxPrice"] = strlen($_GET["maxPrice"]) != 0 ? $_GET["maxPrice"] : 99999999.99; // price field max possibile value
$filterOptions["orderBy"] = $_GET["orderBy"];
$filterOptions["from"] = $_GET["from"];
$filterOptions["howMany"] = $_GET["howMany"];

// optional fields
if (isset($_GET["onlyOffers"])) {
    $filterOptions["onlyOffers"] = true;
}
if (isset($_GET["search"])) {
    $filterOptions["search"] = $_GET["search"];
}
if (isset($_GET["categories"])) {
    $filterOptions["categories"] = explode(",", $_GET["categories"]);
}

// error_log(var_export($dbh->countTotalFilteredProducts($filterOptions), true));

// retrivies the products info from the database with the specified filters
if (!isset($_GET["count"])) {
    $products = $dbh->filterProducts($filterOptions);

    // converts the image name to the image full path
    for($i = 0; $i < count($products); $i++){
        $products[$i]["image_name"] = PROD_DIR.$products[$i]["image_name"];
    }
// retrieves the total amount of products that match the specified filters
} else {
    $products = $dbh->countTotalFilteredProducts($filterOptions);
}

header('Content-Type: application/json');
echo json_encode($products);
?>