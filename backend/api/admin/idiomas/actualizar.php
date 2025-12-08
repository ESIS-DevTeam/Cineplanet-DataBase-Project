<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;
$data = json_decode(file_get_contents('php://input'), true);

try {
    if (!$id) throw new Exception("ID requerido");
    if (empty($data['nombre'])) throw new Exception("Nombre requerido");

    $sql = "UPDATE IDIOMA SET nombre = ? WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("si", $data['nombre'], $id);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
