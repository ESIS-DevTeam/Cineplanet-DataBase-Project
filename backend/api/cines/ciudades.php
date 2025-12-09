<?php
require_once('../../config/conexion.php');
header('Content-Type: application/json');
$conn = conexion::conectar();
$res = $conn->query("CALL ciudad_get_all()");
$ciudades = [];
while ($row = $res->fetch_assoc()) {
    $ciudades[] = $row;
}
echo json_encode(['ciudades' => $ciudades]);
