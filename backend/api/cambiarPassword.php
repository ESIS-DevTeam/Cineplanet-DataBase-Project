<?php
require_once("../config/conexion.php");
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? intval($data['id']) : 0;
$password = isset($data['password']) ? trim($data['password']) : '';

if ($id <= 0 || !$password) {
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

$conn = conexion::conectar();
// Guardar la contraseña en texto plano (sin hasheo)
$stmt = $conn->prepare("UPDATE SOCIO SET password=? WHERE id=?");
$stmt->bind_param("si", $password, $id);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => 'No se pudo actualizar']);
}
