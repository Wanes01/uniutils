<?php
require_once("bootstrap.php");

$params["title"] = "Vetrina";
$params["pages"] = array("Vetrina", "Catalogo", "Contatti", "Login");
$params["scripts"] = array("functions.js", "html-templates.js", "index.js");

require_once("template/base.php");
?>