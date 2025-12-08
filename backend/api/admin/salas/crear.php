<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$data = json_decode(file_get_contents('php://input'), true);

try {
    if (
        empty($data['nombre']) ||
        empty($data['capacidad']) ||
        empty($data['tipo']) ||
        empty($data['idCine'])
    ) {
        throw new Exception("Faltan datos obligatorios");
    }

    $sql = "INSERT INTO SALA (nombre, capacidad, tipo, idCine) VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param(
        "sisi",
        $data['nombre'],
        $data['capacidad'],
        $data['tipo'],
        $data['idCine']
    );
    $stmt->execute();

    echo json_encode(['success' => true, 'id' => $conexion->insert_id]);
    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
