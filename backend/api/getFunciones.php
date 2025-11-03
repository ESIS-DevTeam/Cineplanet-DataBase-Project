<?php
require_once "../business/funcionesBusiness.php";

$funciones = FuncionesBusiness::obtenerFunciones();

header("Content-Type: application/json");
echo json_encode($funciones);
?>
