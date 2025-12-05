<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();

$input = json_decode(file_get_contents('php://input'), true);

$nombre = $input['nombre'] ?? '';
$direccion = $input['direccion'] ?? '';
$telefono = $input['telefono'] ?? '';
$email = $input['email'] ?? '';
$idCiudad = $input['idCiudad'] ?? '';
$imagenNombre = $input['imagen'] ?? '';

if (!$nombre || !$direccion || !$telefono || !$email || !$idCiudad) {
    echo json_encode(['success' => false, 'error' => 'Faltan campos requeridos']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO CINE (nombre, direccion, telefono, email, idCiudad, imagen) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param('ssssss', $nombre, $direccion, $telefono, $email, $idCiudad, $imagenNombre);
$success = $stmt->execute();

if ($success) {
    echo json_encode(['success' => true, 'id' => $conn->insert_id], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
?>
