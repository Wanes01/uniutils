<?php
session_start();

define("PROD_DIR", "./assets/prod/");
require_once("db/database.php");
require_once("utils/functions.php");
$env = parse_ini_file(".env");
$dbh = new DatabaseHelper(
    $env["SERVERNAME"],$env["USERNAME"],$env["PASSWORD"],$env["DBNAME"],$env["PORT"]
);
?>