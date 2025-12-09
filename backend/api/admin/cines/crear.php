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
    $dirDestino = __DIR__ . '/../../../../frontend/images/portrait/cines/';
    if (!is_dir($dirDestino)) {
        mkdir($dirDestino, 0777, true);
    }
    $nombreArchivo = basename($_FILES['imagen']['name']); // <-- solo el nombre original
    $rutaCompleta = $dirDestino . $nombreArchivo;
    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
        $imagenNombre = $nombreArchivo;
    }
}

$stmt = $conn->prepare("CALL cine_create(?, ?, ?, ?, ?, ?, @id)");
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
$stmt->close();

if ($success) {
    // Obtener el id generado
    $result = $conn->query("SELECT @id as id");
    $row = $result->fetch_assoc();
    $newId = (int)$row['id'];
    echo json_encode(['success' => true, 'id' => $newId], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}
?>
