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

$existingCategoriesIds = array();
if ($_POST["existingCategories"] !== "") {
    $existingCategoriesIds = explode(",", $_POST["existingCategories"]);
}
$newCategories = array();
if ($_POST["newCategories"] !== "") {
    foreach (explode(",", $_POST["newCategories"]) as $newCat) {
        // makes the new categories first letter uppercase
        array_push($newCategories, ucfirst($newCat));
    }
}

$image = $_FILES['image'];

$errors = validateProductData(
    $_POST["title"],
    $_POST["description"],
    $_POST["price"],
    $_POST["discountPrice"],
    $newCategories,
    $existingCategoriesIds,
    $_POST["quantity"],
    $dbh,
    $image
);

// if errors occured product can't be added / updated
header('Content-Type: application/json');
if (count($errors) !== 0) {
    echo json_encode($errors);
    return;
}

/* Product data was valid, new category names too */
$newCategoriesIds = count($newCategories) != 0
    ? $dbh->addCategoriesAndGetIds($newCategories)
    : array();

$allCategoriesIds = array_merge($existingCategoriesIds, $newCategoriesIds);

if ($action == "addProduct") {
    // moves the image to the product images directory 
    $uniqueImageName = time() . "_" . $image["name"];
    $destination = PROD_DIR_API . $uniqueImageName;

    // error_log(var_export(array($destination, $image["tmp_name"]), true));
    move_uploaded_file($image["tmp_name"], $destination);

    // adds the product
    $dbh->addProduct(
        $_POST["title"],
        $_POST["description"],
        $_POST["price"],
        $_POST["discountPrice"] == "" ? null : $_POST["discountPrice"],
        $allCategoriesIds,
        $_POST["quantity"],
        $uniqueImageName // multiple images may share the same name. Adds the timestamp to make the name unique
    );
}

echo json_encode($errors);
?>