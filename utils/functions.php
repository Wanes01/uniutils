<?php

define("PASSWORD_MIN_LENGTH", 8);

function validateRegisterData($data, $dbh) {
    define("INPUT_MAX_LENGTH", 255);
    $errors = array();
    list($name, $surname, $address, $email, $username, $password, $passwordCheck) = array_values($data);

    // All fields must not be empty
    foreach ($data as $field) {
        if (strlen($field) == 0) {
            array_push($errors, "Nessun campo deve essere vuoto.");
            break;
        }
    }

    // All fields, except for password, must be shorter or equal in length to INPUT_MAX_LENGTH
    foreach (array($name, $surname, $address, $email, $username) as $field) {
        if (strlen($field) > INPUT_MAX_LENGTH) {
            array_push($errors, "Tutti i campi, tranne la password, devono avere massimo 100 caratteri.");
            break;
        }
    }

    // Checks the uniqueness of the email and username
    if (!$dbh->checkEmailAvailability($email)) {
        array_push($errors, "L'email indicata é giá stata registrata.");
    }

    if (!$dbh->checkUsernameAvailability($username)) {
        array_push($errors, "Lo username indicato é giá stato registrato.");
    }

    // Password check
    if (!isPasswordStrongEnough($password)) {
        array_push($errors, "Password troppo debole: deve contenere almeno una lettera minuscola, "
        . "una lettera maiuscola, un numero, un carattere speciale ed esser lunga almeno "
        . PASSWORD_MIN_LENGTH . " caratteri.");
    }

    if ($password !== $passwordCheck) {
        array_push($errors, "Le password non combaciano.");
    }

    return $errors;
}

/* The password is valid if there is at least a
lowercase char, an uppercase char, a number, a special char
and a minimum length of PASSWORD_MIN_LENGTH chars */
function isPasswordStrongEnough($password) {
    $regex = "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{".PASSWORD_MIN_LENGTH.",}$/";
    return preg_match($regex, $password);
}

/* Saves the user data into the current session */
function loginUser($userData) {
    $_SESSION["userId"] = $userData["id"];
    $_SESSION["name"] = $userData["first_name"];
    $_SESSION["surname"] = $userData["last_name"];
    $_SESSION["address"] = $userData["address"];
    $_SESSION["username"] = $userData["username"];
    $_SESSION["email"] = $userData["email"];
    $_SESSION["isCustomer"] = $userData["role"] == 1; // 1 = client, 0 = vendor
}

/* Get the current session info */
function getSessionInfo() {
    $defaultPages = array("Vetrina", "Catalogo", "Contatti");

    $loggedOutPages = array("Login");
    $customerPages = array("Notifiche", "Carrello", "Ordini", "Logout");
    $vendorPages = array("Notifiche", "Ordini", "Logout");

    $response["loggedIn"] = isset($_SESSION["userId"]);

    // user is not logged in
    if (!isset($_SESSION["userId"])) {
        $response["navigation"] = array_merge($defaultPages, $loggedOutPages);
        return $response;
    }

    // user is logged in, shares the user info
    $userInfoKeys = array("userId", "name", "surname", "address", "username", "email", "isCustomer");

    foreach ($userInfoKeys as $key) {
        $response["user"][$key] = $_SESSION[$key];
    }

    $response["navigation"] = array_merge(
        $defaultPages,
        $_SESSION["isCustomer"] ? $customerPages : $vendorPages
    );

    return $response;
}

function isUserLoggedIn() {
    return isset($_SESSION["userId"]);
}

function isUserCustomer() {
    return $_SESSION["isCustomer"];
}

function validateProductData(
    $title,
    $description,
    $price,
    $discountPrice,
    $newCategories,
    $existingCategoriesIds,
    $quantity,
    $dbh,
    $image = null
) {
    $errors = array();
    
    if (strlen($title) == 0 || strlen($description) == 0) {
        array_push($errors, "Titolo e descrizione non possono essere vuoti.");
    }
    if (strlen($title) > 255) {
        array_push($errors, "Titolo troppo lungo.");
    }
    if (strlen($description) > 10000) {
        array_push($errors, "Descrizione troppo lunga.");
    }
    if (count($newCategories) > 30) {
        array_push($errors, "Aggiunte troppe categorie.");
    }
    if (count($newCategories) == 0 && count($existingCategoriesIds) == 0) {
        array_push($errors, "Un prodotto deve avere almeno una categoria associata.");
    }
    if ($discountPrice != "" && ((float)$discountPrice >= (float)$price)) {
        array_push($errors, "Il prezzo scontato non puó essere maggiore o uguale al prezzo originale.");
    }
    if ((int)$quantity < 1) {
        array_push($errors, "La quantitá del prodotto deve essere almeno 1.");
    }

    // Checks that no new category already exist
    $catNames = array();
    $catData = $dbh->getCategories();
    foreach ($catData as $cat) {
        array_push($catNames, $cat["name"]);
    }

    foreach ($newCategories as $newCatName) {
        if (in_array($newCatName, $catNames)) {
            array_push($errors, "Categorie giá esistenti non possono essere inserite come nuove.");
            break;
        }
    }

    // image is already on server. No need to check further
    if ($image == null) {
        return $errors;
    }

    // Check the image validity
    $allowedTypes = array('image/jpeg', 'image/png');
    $fileType = mime_content_type($image['tmp_name']);

    /* Mime type has to match. Checking the extension alone is not secure enough */
    if (!in_array($fileType, $allowedTypes)) {
        array_push($errors, "Le estensioni valide per l'immagine sono .jpeg / .png");
    }

    list($width, $height) = getimagesize($image['tmp_name']);
    if ($width > 1080 || $height > 1920) {
        array_push($errors, "La dimensione massima delle foto deve essere 1080x1920.");
    }

    $maxSize = 2*1024*1024; // 2MB max
    if ($image['size'] > $maxSize) {
        array_push($errors, "La foto deve pesare massimo 2MB.");
    }

    return $errors;
}

function deleteProductImageFile($id, $dbh) {
    $imageName = $dbh->getProductByID($id)[0]["image_name"];
    unlink(PROD_DIR_API . $imageName);
}

function computeCartPrice($userID, $dbh) {
    $cart = $dbh->getUserCart($userID);
    $price = 0;
    foreach ($cart as $product) {
        $productID = $product["product_id"];
        $productData = ($dbh->getProductByID($productID))[0];
        $price += $product["quantity"] * ($productData["discount_price"] ? $productData["discount_price"] : $productData["price"]);
    }
    return $price;
}

function formatDateIt($date) {
    $dataFormat = DateTime::createFromFormat('Y-m-d', $date);
    return $dataFormat->format('d-m-Y');
}

function computeDiscountPercentage($original, $offer) {
    $perc = (1 - ($offer / $original)) * 100;
    return number_format($perc, 2);
}

function validateNotificationData($title, $message) {
    define("TITLE_MAX_LENGTH", 255);
    define("MESSAGE_MAX_LENGTH", 5000);
    $errors = array();

    if (strlen($title) == 0 || strlen($message) == 0) {
        array_push($errors, "Il titolo ed il messaggio non possono essere vuoti.");
    }
    if (strlen($title) > TITLE_MAX_LENGTH) {
        array_push($errors, "Il titolo non deve superare " . TITLE_MAX_LENGTH . " caratteri.");
    }
    if (strlen($message) > MESSAGE_MAX_LENGTH) {
        array_push($errors, "Il messaggio non deve superare " . MESSAGE_MAX_LENGTH . " caratteri.");
    }

    return $errors;
}
?>