<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$data = json_decode(file_get_contents('php://input'), true);

try {
    $id = $data['id'] ?? null;
    if (!$id) throw new Exception("ID no proporcionado");

    $stmt = $conexion->prepare("CALL cine_delete(?)");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    echo json_encode(['success' => true]);
    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
