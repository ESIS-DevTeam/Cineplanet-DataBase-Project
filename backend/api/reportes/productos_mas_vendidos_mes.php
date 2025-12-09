<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../config/conexion.php';

$conexion = conexion::conectar();

try {
    $result = $conexion->query("CALL reporte_productos_mas_vendidos_mes()");
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $data]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
