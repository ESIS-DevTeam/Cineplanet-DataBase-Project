<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;
$data = json_decode(file_get_contents('php://input'), true);

try {
    if (!$id) throw new Exception("ID de promoción no proporcionado");
    if (
        empty($data['nombre']) ||
        empty($data['tipo']) ||
        !isset($data['valor'])
    ) {
        throw new Exception("Faltan datos obligatorios");
    }

    $sql = "UPDATE PROMO SET
        nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, tipo = ?, valor = ?, aplicaA = ?,
        requiereSocio = ?, gradoMinimo = ?, requiereEmpleado = ?, combinable = ?,
        requierePuntos = ?, puntosNecesarios = ?, tieneStock = ?, stock = ?, aplicaRestriccion = ?, estado = ?
        WHERE id = ?";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param(
        "sssssdsssssssssisi",
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
        $data['estado'],
        $id
    );
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
