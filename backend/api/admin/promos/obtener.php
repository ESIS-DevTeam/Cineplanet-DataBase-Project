<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;

try {
    if (!$id) throw new Exception("ID de promoción no proporcionado");

    $sql = "SELECT * FROM PROMO WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $promo = $result->fetch_assoc();
    $stmt->close();

    if ($promo) {
        echo json_encode(['success' => true, 'data' => $promo]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Promoción no encontrada']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
