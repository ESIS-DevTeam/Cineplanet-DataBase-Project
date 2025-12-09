<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;
$data = json_decode(file_get_contents("php://input"), true);

try {
    if (!$id) throw new Exception("ID no proporcionado");
    if (!isset($data['idPelicula'], $data['idSala'], $data['idFormato'], $data['idIdioma'], $data['fecha'], $data['hora'], $data['precio'], $data['estado'])) {
        throw new Exception("Faltan campos requeridos");
    }
    
    $sql = "CALL funcion_update(?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("iiiissdsi",
        $id,
        $data['idPelicula'],
        $data['idSala'],
        $data['idFormato'],
        $data['idIdioma'],
        $data['fecha'],
        $data['hora'],
        $data['precio'],
        $data['estado']
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Función actualizada']);
    } else {
        throw new Exception("Error al actualizar: " . $stmt->error);
    }
    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
