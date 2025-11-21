<?php
require_once('../../config/conexion.php');
header('Content-Type: application/json');
$conn = conexion::conectar();
$res = $conn->query("SELECT id, nombre FROM CIUDAD ORDER BY nombre");
$ciudades = [];
while ($row = $res->fetch_assoc()) {
    $ciudades[] = $row;
}
echo json_encode(['ciudades' => $ciudades]);
