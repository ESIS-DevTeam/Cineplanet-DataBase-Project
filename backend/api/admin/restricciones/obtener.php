<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;

try {
    if (!$id) throw new Exception("ID requerido");

    $sql = "SELECT id, nombre FROM RESTRICCION WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    if ($row) {
        echo json_encode(['success' => true, 'data' => $row]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No encontrado']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
