<?php
header('Content-Type: application/json');
include '../../../config/conexion.php';

$id = $_GET['id'] ?? null;
$conexion = conexion::conectar();

$sql = "SELECT s.*, u.nombre, u.email, u.numeroDocumento, u.tipoDocumento
        FROM SOCIO s
        JOIN USUARIO u ON s.id = u.id
        WHERE s.id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    echo json_encode(['success' => true, 'data' => $resultado->fetch_assoc()]);
} else {
    echo json_encode(['success' => false, 'message' => 'Socio no encontrado']);
}
$stmt->close();
?>
