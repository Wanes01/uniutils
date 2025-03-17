<?php
require_once '../bootstrap.php';

$response = getSessionInfo();
header('Content-Type: application/json');
echo json_encode($response);
?>