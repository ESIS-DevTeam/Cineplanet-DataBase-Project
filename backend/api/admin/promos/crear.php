<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$data = json_decode(file_get_contents('php://input'), true);

try {
    if (
        empty($data['nombre']) ||
        empty($data['tipo']) ||
        !isset($data['valor'])
    ) {
        throw new Exception("Faltan datos obligatorios");
    }

    $sql = "CALL promo_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @id)";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param(
        "sssssdsssssssssis",
        $data['nombre'],
        $data['descripcion'],
        $data['fecha_inicio'],
        $data['fecha_fin'],
        $data['tipo'],
        $data['valor'],
        $data['aplicaA'],
        $data['requiereSocio'],
        $data['gradoMinimo'],
        $data['requiereEmpleado'],
        $data['combinable'],
        $data['requierePuntos'],
        $data['puntosNecesarios'],
        $data['tieneStock'],
        $data['stock'],
        $data['aplicaRestriccion'],
        $data['estado']
    );
    $stmt->execute();
    $stmt->close();
    
    $result = $conexion->query("SELECT @id as id");
    $idPromo = $result->fetch_assoc()['id'];

    echo json_encode(['success' => true, 'id' => $idPromo]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
