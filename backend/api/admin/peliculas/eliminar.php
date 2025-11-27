<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Obtener nombre de portada antes de eliminar
$portada = '';
$stmtSelect = $conn->prepare("SELECT portada FROM PELICULA WHERE id = ?");
$stmtSelect->bind_param('i', $id);
$stmtSelect->execute();
$stmtSelect->bind_result($portada);
$stmtSelect->fetch();
$stmtSelect->close();

// Eliminar la película
$stmt = $conn->prepare("DELETE FROM PELICULA WHERE id = ?");
$stmt->bind_param('i', $id);
$success = $stmt->execute();
$stmt->close();

// Eliminar imagen del disco si existe
if ($success && $portada) {
    $rutaImagen = __DIR__ . '/../../../../frontend/images/portrait/movie/' . $portada;
    if (file_exists($rutaImagen)) {
        unlink($rutaImagen);
    }
}

if ($success) {
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
?>