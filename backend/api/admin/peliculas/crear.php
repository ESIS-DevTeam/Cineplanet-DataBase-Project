<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();

$nombre = $_POST['nombre'] ?? '';
$genero = isset($_POST['genero']) ? (int)$_POST['genero'] : 0;
$duracion = isset($_POST['duracion']) ? (int)$_POST['duracion'] : 0;
$restriccion = isset($_POST['restriccion']) ? (int)$_POST['restriccion'] : 0;
$restriccionComercial = isset($_POST['restriccionComercial']) ? (int)$_POST['restriccionComercial'] : 1;
$sinopsis = $_POST['sinopsis'] ?? '';
$autor = $_POST['autor'] ?? '';
$trailer = $_POST['trailer'] ?? '';
$estado = $_POST['estado'] ?? 'activa';

$portadaNombre = '';
if (isset($_FILES['portada']) && $_FILES['portada']['error'] === UPLOAD_ERR_OK) {
    $dirDestino = __DIR__ . '/../../../../frontend/images/portrait/movie/';
    if (!is_dir($dirDestino)) {
        mkdir($dirDestino, 0777, true);
    }
    $nombreArchivo = uniqid('movie_') . '_' . basename($_FILES['portada']['name']);
    $rutaCompleta = $dirDestino . $nombreArchivo;
    if (move_uploaded_file($_FILES['portada']['tmp_name'], $rutaCompleta)) {
        $portadaNombre = $nombreArchivo; // Solo el nombre del archivo
    }
}

$stmt = $conn->prepare("INSERT INTO PELICULA (nombre, genero, duracion, restriccion, restriccionComercial, sinopsis, autor, trailer, portada, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param(
    'siisiissss',
    $nombre,
    $genero,
    $duracion,
    $restriccion,
    $restriccionComercial,
    $sinopsis,
    $autor,
    $trailer,
    $portadaNombre,
    $estado
);
$success = $stmt->execute();
if ($success) {
    echo json_encode(['success' => true, 'id' => (int)$conn->insert_id], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
?>