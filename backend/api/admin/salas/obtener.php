<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;

try {
    if (!$id) throw new Exception("ID de sala no proporcionado");

    $sql = "SELECT * FROM SALA WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $sala = $result->fetch_assoc();
    $stmt->close();

    if ($sala) {
        // Obtener plano de sala
        $sqlPlano = "SELECT fila, numero, tipo FROM PLANO_SALA WHERE idSala = ? ORDER BY fila, numero";
        $stmtPlano = $conexion->prepare($sqlPlano);
        $stmtPlano->bind_param("i", $id);
        $stmtPlano->execute();
        $resultPlano = $stmtPlano->get_result();
        $planoSala = [];
        while ($row = $resultPlano->fetch_assoc()) {
            $planoSala[] = $row;
        }
        $stmtPlano->close();
        $sala['planoSala'] = $planoSala;

        echo json_encode(['success' => true, 'data' => $sala]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Sala no encontrada']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
