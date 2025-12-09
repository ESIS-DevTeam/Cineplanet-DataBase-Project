<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;

try {
    if (!$id) throw new Exception("ID no proporcionado");

    $sql = "CALL producto_get_by_id(?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Producto no encontrado");
    }

    $data = $result->fetch_assoc();
    echo json_encode(['success' => true, 'data' => $data]);
    $stmt->close();
} catch (Exception $e) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
