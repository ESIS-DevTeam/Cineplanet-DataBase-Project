<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();

$nombre = $_POST['nombre'] ?? '';
$direccion = $_POST['direccion'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$email = $_POST['email'] ?? '';
$idCiudad = $_POST['idCiudad'] ?? null;

$imagenNombre = '';
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $dirDestino = __DIR__ . '/../../../../frontend/images/portrait/cine/';
    if (!is_dir($dirDestino)) {
        mkdir($dirDestino, 0777, true);
    }
    $nombreArchivo = uniqid('cine_') . '_' . basename($_FILES['imagen']['name']);
    $rutaCompleta = $dirDestino . $nombreArchivo;
    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
        $imagenNombre = $nombreArchivo; // Solo el nombre, no la ruta
    }
}

$stmt = $conn->prepare("INSERT INTO CINE (nombre, direccion, telefono, email, imagen, idCiudad) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param(
    'sssssi',
    $nombre,
    $direccion,
    $telefono,
    $email,
    $imagenNombre,
    $idCiudad
);
$success = $stmt->execute();
if ($success) {
    echo json_encode(['success' => true, 'id' => (int)$conn->insert_id], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
?>
