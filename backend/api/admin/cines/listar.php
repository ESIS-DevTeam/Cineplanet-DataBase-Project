<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();

try {
    $sql = "SELECT CINE.*, CIUDAD.nombre AS ciudad FROM CINE LEFT JOIN CIUDAD ON CINE.idCiudad = CIUDAD.id ORDER BY CINE.nombre ASC";
    $result = $conexion->query($sql);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $data]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
