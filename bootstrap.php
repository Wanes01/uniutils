<?php
session_start();

require_once("db/database.php");
require_once("utils/functions.php");

define("PROD_DIR", "./assets/prod/");
define("PROD_DIR_API", "../assets/prod/");

$env = parse_ini_file(".env");
$dbh = new DatabaseHelper(
    $env["SERVERNAME"],$env["USERNAME"],$env["PASSWORD"],$env["DBNAME"],$env["PORT"]
);
?>