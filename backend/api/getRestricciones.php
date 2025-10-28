<?php
require_once "../business/restriccionBusiness.php";

$restricciones = RestriccionBusiness::obtenerRestricciones();

header("Content-Type: application/json");
echo json_encode($restricciones);
?>
