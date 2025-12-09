<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$idCiudad = $_GET['idCiudad'] ?? null;

try {
    if (!$idCiudad) throw new Exception("ID de ciudad no proporcionado");
    
    $stmt = $conexion->prepare("CALL cine_get_by_ciudad(?)");
    $stmt->bind_param("i", $idCiudad);
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
