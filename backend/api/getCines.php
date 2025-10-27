<?php
require_once "../business/cineBusiness.php";

$cines = CineBusiness::obtenerCines();

header("Content-Type: application/json");
echo json_encode($cines);
?>
