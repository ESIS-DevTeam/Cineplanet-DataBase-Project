<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;
$data = json_decode(file_get_contents('php://input'), true);

try {
    if (!$id) throw new Exception("ID de sala no proporcionado");
    if (
        empty($data['nombre']) ||
        empty($data['capacidad']) ||
        empty($data['tipo']) ||
        empty($data['idCine'])
    ) {
        throw new Exception("Faltan datos obligatorios");
    }

    $sql = "UPDATE SALA SET nombre = ?, capacidad = ?, tipo = ?, idCine = ? WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param(
        "sisii",
        $data['nombre'],
        $data['capacidad'],
        $data['tipo'],
        $data['idCine'],
        $id
    );
    $stmt->execute();
    $stmt->close();

    // Actualizar plano de sala: eliminar y volver a crear
    if (!empty($data['planoSala']) && is_array($data['planoSala'])) {
        $conexion->query("DELETE FROM PLANO_SALA WHERE idSala = $id");
        $sqlPlano = "INSERT INTO PLANO_SALA (idSala, fila, numero, tipo) VALUES (?, ?, ?, ?)";
        $stmtPlano = $conexion->prepare($sqlPlano);
        foreach ($data['planoSala'] as $asiento) {
            $fila = $asiento['fila'];
            $numero = $asiento['numero'];
            $tipo = $asiento['tipo'];
            $stmtPlano->bind_param("isis", $id, $fila, $numero, $tipo);
            $stmtPlano->execute();
        }
        $stmtPlano->close();
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
