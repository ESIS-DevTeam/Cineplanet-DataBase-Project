<?php
require_once "../data/peliculaData.php";

header('Content-Type: application/json');

$peliculas = PeliculaData::listarConFuncionActiva();
echo json_encode($peliculas);
?>
