<?php
require_once '../bootstrap.php';

error_log(var_export($_GET, true));

$response = "TEST";
header('Content-Type: application/json');
echo json_encode($response);
?>