<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;

try {
    if (!$id) throw new Exception("ID no proporcionado");
    
    $sql = "SELECT 
                f.*,
                s.idCine,
                c.idCiudad
            FROM FUNCION f
            LEFT JOIN SALA s ON f.idSala = s.id
            LEFT JOIN CINE c ON s.idCine = c.id
            WHERE f.id = ?";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Función no encontrada");
    }
    
    $data = $result->fetch_assoc();
    echo json_encode(['success' => true, 'data' => $data]);
    $stmt->close();
} catch (Exception $e) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
