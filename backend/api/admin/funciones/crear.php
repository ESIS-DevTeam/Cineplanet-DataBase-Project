<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$data = json_decode(file_get_contents("php://input"), true);

try {
    if (!isset($data['idPelicula'], $data['idSala'], $data['idFormato'], $data['idIdioma'], $data['fecha'], $data['hora'], $data['precio'], $data['estado'])) {
        throw new Exception("Faltan campos requeridos");
    }
    
    $sql = "INSERT INTO FUNCION (idPelicula, idSala, idFormato, idIdioma, fecha, hora, precio, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("iiiissds", 
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
        echo json_encode(['success' => true, 'message' => 'Función creada', 'id' => $conexion->insert_id]);
    } else {
        throw new Exception("Error al crear: " . $stmt->error);
    }
    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
