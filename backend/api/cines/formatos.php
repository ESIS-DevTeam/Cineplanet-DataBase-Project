<?php
require_once('../../config/conexion.php');
header('Content-Type: application/json');
$conn = conexion::conectar();
$res = $conn->query("SELECT id, nombre FROM FORMATO ORDER BY nombre");
$formatos = [];
while ($row = $res->fetch_assoc()) {
    $formatos[] = $row;
}
echo json_encode(['formatos' => $formatos]);
