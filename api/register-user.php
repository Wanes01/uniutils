<?php
require_once '../bootstrap.php';

//error_log(var_export($_POST, true));
$errors = validateRegisterData($_POST, $dbh);
header('Content-Type: application/json');
echo json_encode($errors);
?>