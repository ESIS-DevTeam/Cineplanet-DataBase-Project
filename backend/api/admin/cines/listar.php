<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();

try {
    $stmt = $conexion->prepare("CALL cine_get_all_with_ciudad()");
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $data]);
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
