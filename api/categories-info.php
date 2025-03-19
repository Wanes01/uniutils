<?php
require_once '../bootstrap.php';

$response = $dbh->getCategories();
header('Content-Type: application/json');
echo json_encode($response);
?>