<?php
require_once "../business/ciudadBusiness.php";

$ciudades = CiudadBusiness::obtenerCiudades();

header("Content-Type: application/json");
echo json_encode($ciudades);
?>
