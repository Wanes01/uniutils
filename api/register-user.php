<?php
require_once '../bootstrap.php';

if (isset($_SESSION["userId"])) {
    header('Content-Type: application/json');
    echo json_encode(array("Per registrare un altro utente é prima necessario effettuare il logout."));
    return;
}

$errors = validateRegisterData($_POST, $dbh);

// all fields are valid. User can be registered
if (count($errors) == 0) {
    $dbh->registerUser(
        $_POST["name"],
        $_POST["surname"],
        $_POST["address"],
        $_POST["email"],
        $_POST["username"],
        password_hash($_POST["password"], PASSWORD_ARGON2I)
    );
}

header('Content-Type: application/json');
echo json_encode($errors);
//error_log(var_export($_POST, true));
?>