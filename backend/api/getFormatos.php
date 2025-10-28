<?php
require_once "../business/formatoBusiness.php";

$formatos = FormatoBusiness::obtenerFormatos();

header("Content-Type: application/json");
echo json_encode($formatos);
?>
