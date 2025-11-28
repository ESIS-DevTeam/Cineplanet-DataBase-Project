<?php
header('Content-Type: application/json');
include '../../../config/conexion.php';

$id = $_GET['id'] ?? null;
$conexion = conexion::conectar();

$sql = "SELECT u.*, 
        CASE 
            WHEN s.id IS NOT NULL THEN 'Socio'
            ELSE 'Cliente Regular'
        END as estado_cliente
        FROM USUARIO u
        LEFT JOIN SOCIO s ON u.id = s.id
        WHERE u.id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    echo json_encode(['success' => true, 'data' => $resultado->fetch_assoc()]);
} else {
    echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
}
$stmt->close();
?>
