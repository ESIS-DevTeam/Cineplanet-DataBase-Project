<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$data = json_decode(file_get_contents('php://input'), true);

try {
    if (empty($data['nombre'])) throw new Exception("Nombre requerido");

    $sql = "CALL ciudad_create(?, @id)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $data['nombre']);
    $stmt->execute();
    $stmt->close();
    
    $result = $conexion->query("SELECT @id as id");
    $id = $result->fetch_assoc()['id'];

    echo json_encode(['success' => true, 'id' => $id]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
