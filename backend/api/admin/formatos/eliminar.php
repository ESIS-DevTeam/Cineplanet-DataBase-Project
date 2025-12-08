<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;

try {
    if (!$id) throw new Exception("ID requerido");

    $sql = "DELETE FROM FORMATO WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
