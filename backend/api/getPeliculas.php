<?php
require_once "../business/peliculaBusiness.php";

$peliculas = PeliculaBusiness::obtenerPeliculasActivas();

header("Content-Type: application/json");
echo json_encode($peliculas);
?>
