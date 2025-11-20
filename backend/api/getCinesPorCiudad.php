<?php
require_once("../config/conexion.php");
$conn = conexion::conectar();

$idCiudad = isset($_GET['idCiudad']) ? intval($_GET['idCiudad']) : 0;
$cines = [];

if ($idCiudad > 0) {
    $res = $conn->query("SELECT id, nombre FROM CINE WHERE idCiudad = $idCiudad ORDER BY nombre ASC");
    while ($row = $res->fetch_assoc()) {
        $cines[] = $row;
    }
}

header('Content-Type: application/json');
echo json_encode($cines);
?>
