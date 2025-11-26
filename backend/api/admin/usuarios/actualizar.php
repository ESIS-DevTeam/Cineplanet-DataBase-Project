<?php
header('Content-Type: application/json');
include '../../../config/conexion.php';

$id = $_GET['id'] ?? null;
$datos = json_decode(file_get_contents("php://input"), true);
$conexion = conexion::conectar();

// Validar que el email no exista en otro usuario
$sqlCheck = "SELECT id FROM USUARIO WHERE email = ? AND id != ?";
$stmtCheck = $conexion->prepare($sqlCheck);
$stmtCheck->bind_param('si', $datos['email'], $id);
$stmtCheck->execute();
if ($stmtCheck->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'El email ya está registrado']);
    $stmtCheck->close();
    exit;
}
$stmtCheck->close();

$sql = "UPDATE USUARIO SET nombre=?, email=?, tipoDocumento=?, numeroDocumento=?, tipo=? WHERE id=?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param('sssssi', 
    $datos['nombre'], 
    $datos['email'], 
    $datos['tipoDocumento'], 
    $datos['numeroDocumento'], 
    $datos['tipo'], 
    $id
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Usuario actualizado']);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
$stmt->close();
?>
