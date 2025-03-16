<?php
require_once '../bootstrap.php';

$response["success"] = false;
header('Content-Type: application/json');

if (isset($_SESSION["userId"])) {
    $response["message"] = "Per accedere con un nuovo utente bisogna prima effettuare il logout.";
    echo json_encode($response);
    return;
}

// Checks if any account matches this email
$result = $dbh->getUserInfo($_POST["email"]);

if (!$result) {
    $response["message"] = "Non esiste un account associato a questa email.";
    echo json_encode($response);
    return;
}

$userData = $result[0];

/* The email matches an account. The password hash must match too */
if (!password_verify($_POST["password"], $userData["password_hash"])) {
    $response["message"] = "La password non é corretta.";
    echo json_encode($response);
    return;
}

// The user is successfully logged in
loginUser($userData);

$response["success"] = true;
echo json_encode($response);
?>