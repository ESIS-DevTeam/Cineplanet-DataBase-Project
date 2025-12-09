<?php
require_once('../../config/conexion.php');
header('Content-Type: application/json');
$conn = conexion::conectar();
$res = $conn->query("CALL formato_get_all()");
$formatos = [];
while ($row = $res->fetch_assoc()) {
    $formatos[] = $row;
}
echo json_encode(['formatos' => $formatos]);
