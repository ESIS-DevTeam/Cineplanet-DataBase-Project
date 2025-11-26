<?php
header('Content-Type: application/json');
include '../../../config/conexion.php';

$datos = json_decode(file_get_contents("php://input"), true);
$conexion = conexion::conectar();

// Validar que el email no exista
$sqlCheck = "SELECT id FROM USUARIO WHERE email = ?";
$stmtCheck = $conexion->prepare($sqlCheck);
$stmtCheck->bind_param('s', $datos['email']);
$stmtCheck->execute();
if ($stmtCheck->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'El email ya está registrado']);
    $stmtCheck->close();
    exit;
}
$stmtCheck->close();

$sql = "INSERT INTO USUARIO (nombre, email, tipoDocumento, numeroDocumento, tipo) VALUES (?, ?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);
$stmt->bind_param('sssss', 
    $datos['nombre'], 
    $datos['email'], 
    $datos['tipoDocumento'], 
    $datos['numeroDocumento'], 
    $datos['tipo']
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Usuario creado', 'id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
$stmt->close();
?>
