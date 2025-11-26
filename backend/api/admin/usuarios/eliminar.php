<?php
header('Content-Type: application/json');
include '../../../config/conexion.php';

$id = $_GET['id'] ?? null;
$conexion = conexion::conectar();

// Si es socio, eliminar primero de SOCIO (por FK)
$sqlDelSocio = "DELETE FROM SOCIO WHERE id = ?";
$stmtDelSocio = $conexion->prepare($sqlDelSocio);
$stmtDelSocio->bind_param('i', $id);
$stmtDelSocio->execute();
$stmtDelSocio->close();

// Luego eliminar de USUARIO
$sql = "DELETE FROM USUARIO WHERE id=?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Usuario eliminado']);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
$stmt->close();
?>
