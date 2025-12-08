<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;

try {
    if (!$id) throw new Exception("ID de sala no proporcionado");

    $sql = "SELECT * FROM SALA WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $sala = $result->fetch_assoc();

    if ($sala) {
        echo json_encode(['success' => true, 'data' => $sala]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Sala no encontrada']);
    }
    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
