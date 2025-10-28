<?php
require_once "../business/generoBusiness.php";

$generos = GeneroBusiness::obtenerGeneros();

header("Content-Type: application/json");
echo json_encode($generos);
?>
