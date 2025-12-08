<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();

try {
    $sql = "SELECT s.id, s.nombre, s.capacidad, s.tipo, s.idCine, c.nombre AS cine_nombre
            FROM SALA s
            INNER JOIN CINE c ON s.idCine = c.id
            ORDER BY s.id DESC";
    $result = $conexion->query($sql);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $data]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
