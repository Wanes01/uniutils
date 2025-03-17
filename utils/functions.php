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

?>