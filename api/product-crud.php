<?php
require_once '../bootstrap.php';

// Only the vendor can manage the products
if (!isUserLoggedIn() || isUserCustomer()) {
    return;
}

if (!isset($_POST["CRUDAction"])) {
    return;
}

$action = $_POST["CRUDAction"];

if ($action == "deleteProduct") {
    return;
}

// User added or updated a product, input fields must be checked
$existingCategoriesIds = explode(",", $_POST["existingCategories"]);
$newCategories = explode(",", $_POST["newCategories"]);

$errors = validateProductData(
    $_POST["title"],
    $_POST["description"],
    $_POST["price"],
    $_POST["discountPrice"],
    $newCategories,
    $existingCategoriesIds,
    $_POST["quantity"],
    $dbh,
    $_FILES['image']
);

error_log(var_export($errors, true));

header('Content-Type: application/json');
echo json_encode($errors);
?>