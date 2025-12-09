<?php
header('Content-Type: application/json');
include '../../../config/conexion.php';

$id = $_GET['id'] ?? null;
$conexion = conexion::conectar();

// Eliminar de SOCIO
$sql = "CALL socio_delete(?)";
$stmt = $conexion->prepare($sql);
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Socio eliminado']);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
$stmt->close();
?>
