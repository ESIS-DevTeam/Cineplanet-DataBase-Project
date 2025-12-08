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
    $idSala = $conexion->insert_id;
    $stmt->close();

    // Crear plano de sala
    if (!empty($data['planoSala']) && is_array($data['planoSala'])) {
        $sqlPlano = "INSERT INTO PLANO_SALA (idSala, fila, numero, tipo) VALUES (?, ?, ?, ?)";
        $stmtPlano = $conexion->prepare($sqlPlano);
        foreach ($data['planoSala'] as $asiento) {
            $fila = $asiento['fila'];
            $numero = $asiento['numero'];
            $tipo = $asiento['tipo'];
            $stmtPlano->bind_param("isis", $idSala, $fila, $numero, $tipo);
            $stmtPlano->execute();
        }
        $stmtPlano->close();
    }

    echo json_encode(['success' => true, 'id' => $idSala]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
