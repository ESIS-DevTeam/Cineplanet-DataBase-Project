<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$idCine = $_GET['idCine'] ?? null;

try {
    if (!$idCine) throw new Exception("ID de cine no proporcionado");
    
    $sql = "CALL sala_get_by_cine(?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idCine);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $data]);
    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
