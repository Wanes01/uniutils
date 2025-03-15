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

?>