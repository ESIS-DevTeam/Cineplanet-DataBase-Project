<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();

$input = json_decode(file_get_contents('php://input'), true);

$id = $input['id'] ?? '';
$nombre = $input['nombre'] ?? '';
$direccion = $input['direccion'] ?? '';
$telefono = $input['telefono'] ?? '';
$email = $input['email'] ?? '';
$idCiudad = $input['idCiudad'] ?? '';
$imagenNombre = $input['imagen'] ?? '';

if (!$id) {
    echo json_encode(['success' => false, 'error' => 'ID no proporcionado']);
    exit;
}
if (!$nombre || !$direccion || !$telefono || !$email || !$idCiudad) {
    echo json_encode(['success' => false, 'error' => 'Faltan campos requeridos']);
    exit;
}

$stmt = $conn->prepare("UPDATE CINE SET nombre=?, direccion=?, telefono=?, email=?, idCiudad=?, imagen=? WHERE id=?");
$stmt->bind_param('ssssssi', $nombre, $direccion, $telefono, $email, $idCiudad, $imagenNombre, $id);
$success = $stmt->execute();

if ($success) {
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
?>
