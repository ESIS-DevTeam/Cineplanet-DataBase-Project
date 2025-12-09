<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();

$id = isset($_POST['id']) ? $_POST['id'] : null;
$nombre = $_POST['nombre'] ?? '';
$direccion = $_POST['direccion'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$email = $_POST['email'] ?? '';
$idCiudad = $_POST['idCiudad'] ?? null;

// Obtener imagen actual
$imagenActual = '';
$stmtSelect = $conn->prepare("CALL cine_get_by_id(?)");
$stmtSelect->bind_param('i', $id);
$stmtSelect->execute();
$result = $stmtSelect->get_result();
if ($row = $result->fetch_assoc()) {
    $imagenActual = $row['imagen'];
}
$stmtSelect->close();

$imagenNombre = $imagenActual;
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $dirDestino = __DIR__ . '/../../../../frontend/images/portrait/cines/';
    if (!is_dir($dirDestino)) {
        mkdir($dirDestino, 0777, true);
    }
    $nombreArchivo = basename($_FILES['imagen']['name']); // <-- solo el nombre original
    $rutaCompleta = $dirDestino . $nombreArchivo;
    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
        $imagenNombre = $nombreArchivo;
        // Eliminar imagen anterior si es diferente
        if ($imagenActual && $imagenActual !== $imagenNombre) {
            $rutaAnterior = $dirDestino . $imagenActual;
            if (file_exists($rutaAnterior)) {
                unlink($rutaAnterior);
            }
        }
    }
}

$stmt = $conn->prepare("UPDATE CINE SET nombre=?, direccion=?, telefono=?, email=?, imagen=?, idCiudad=? WHERE id=?");
$stmt->bind_param(
    'ssssssi',
    $nombre,
    $direccion,
    $telefono,
    $email,
    $imagenNombre,
    $idCiudad,
    $id
);
$success = $stmt->execute();
if ($success) {
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
?>
