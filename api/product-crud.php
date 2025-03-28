<?php
require_once '../bootstrap.php';

// users get notified of an offert if the product has at leat a MIN_DISCOUNT_FOR_NOTIFICATION % discount
define ("MIN_DISCOUNT_FOR_NOTIFICATION", 20);

define("CRUD_ADD", "addProduct");
define("CRUD_UPDATE", "updateProduct");
define("CRUD_DELETE", "deleteProduct");

// Only the vendor can manage the products
if (!isUserLoggedIn() || isUserCustomer() || !isset($_POST["CRUDAction"])) {
    return;
}

$action = $_POST["CRUDAction"];

header('Content-Type: application/json');

// User deletes a product
if ($action == CRUD_DELETE) {
    deleteProductImageFile($_POST["id"], $dbh);
    $dbh->deleteProductById($_POST["id"]);
    // some categories may be not associated with a product anymore
    $dbh->deleteUnusedCategories();
    echo json_encode(array("success" => true));
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

// on update the image is not mandatory
$image = null;
if ($action == CRUD_ADD
    || ($action == CRUD_UPDATE && isset($_FILES['image']))) {
        $image = $_FILES['image'];
}

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
if (count($errors) !== 0) {
    echo json_encode($errors);
    return;
}

/* Product data was valid, new category names too */
$newCategoriesIds = count($newCategories) != 0
    ? $dbh->addCategoriesAndGetIds($newCategories)
    : array();

$allCategoriesIds = array_merge($existingCategoriesIds, $newCategoriesIds);

// moves the image to the product images directory 
if ($action == CRUD_ADD
    || ($action == CRUD_UPDATE && isset($_FILES['image']))) {
    // multiple images may share the same name. Adds the timestamp to make the name unique
    $uniqueImageName = time() . "_" . $image["name"];
    $destination = PROD_DIR_API . $uniqueImageName;
    move_uploaded_file($image["tmp_name"], $destination);
}

// user added a product
if ($action == CRUD_ADD) {
    $dbh->addProduct(
        $_POST["title"],
        $_POST["description"],
        $_POST["price"],
        $_POST["discountPrice"] == "" ? null : $_POST["discountPrice"],
        $allCategoriesIds,
        $_POST["quantity"],
        $uniqueImageName
    );
// user updated a product
} else {
    // user may have changed the image. Delete the previews one if so
    if (isset($_FILES['image'])) {
        deleteProductImageFile($_POST["id"], $dbh);
    }
    $dbh->updateProductById(
        $_POST["id"],
        $_POST["title"],
        $_POST["description"],
        $_POST["price"],
        $_POST["discountPrice"] == "" ? null : $_POST["discountPrice"],
        $allCategoriesIds,
        $_POST["quantity"],
        isset($uniqueImageName) ? $uniqueImageName : null
    );
    // on update some categories may not be associated with products anymore
    $dbh->deleteUnusedCategories();
}

// notify all the customers if it's a big discount
if ($_POST["discountPrice"] != "") {
    $perc = computeDiscountPercentage($_POST["price"], $_POST["discountPrice"]);
    if ($perc >= MIN_DISCOUNT_FOR_NOTIFICATION) {
        $title = "Super sconto per te!";
        $message = 'Dai una occhiata a "' . $_POST["title"] .'" ad un prezzo imperdibibile! Con un mega sconto del ' . $perc . '%, lo puoi prendere a soli €' . $_POST["discountPrice"] . ' al posto di €' . $_POST["price"] . '. Le scorte sono limitate, affrettati!';
        // the notification is sent to all customers
        $dbh->sendNotification($title, $message);
    }
}

echo json_encode($errors);
?>