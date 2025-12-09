<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

$nombre = $_POST['nombre'] ?? '';
$genero = isset($_POST['genero']) ? (int)$_POST['genero'] : 0;
$duracion = isset($_POST['duracion']) ? (int)$_POST['duracion'] : 0;
$restriccion = isset($_POST['restriccion']) ? (int)$_POST['restriccion'] : 0;
$restriccionComercial = isset($_POST['restriccionComercial']) ? (int)$_POST['restriccionComercial'] : 1;
$sinopsis = $_POST['sinopsis'] ?? '';
$autor = $_POST['autor'] ?? '';
$trailer = $_POST['trailer'] ?? '';
$estado = $_POST['estado'] ?? 'activa';

$portadaNombre = $_POST['portada'] ?? '';

// Obtener nombre de portada actual antes de actualizar
$portadaActual = '';
$stmtSelect = $conn->prepare("SELECT portada FROM PELICULA WHERE id=?");
$stmtSelect->bind_param('i', $id);
$stmtSelect->execute();
$stmtSelect->bind_result($portadaActual);
$stmtSelect->fetch();
$stmtSelect->close();

if (isset($_FILES['portada']) && $_FILES['portada']['error'] === UPLOAD_ERR_OK) {
    $dirDestino = __DIR__ . '/../../../../frontend/images/portrait/movie/';
    if (!is_dir($dirDestino)) {
        mkdir($dirDestino, 0777, true);
    }
    // Cambia aquí para usar el nombre original
    $nombreArchivo = basename($_FILES['portada']['name']);
    $rutaCompleta = $dirDestino . $nombreArchivo;
    if (move_uploaded_file($_FILES['portada']['tmp_name'], $rutaCompleta)) {
        $portadaNombre = $nombreArchivo;
        // Eliminar imagen anterior si existe y es distinta de la nueva
        if ($portadaActual && $portadaActual !== $portadaNombre) {
            $rutaAnterior = $dirDestino . $portadaActual;
            if (file_exists($rutaAnterior)) {
                unlink($rutaAnterior);
            }
        }
    }
}

    $stmt = $conn->prepare("CALL pelicula_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param(
    'siisiissssi',
    $nombre,
    $genero,
    $duracion,
    $restriccion,
    $restriccionComercial,
    $sinopsis,
    $autor,
    $trailer,
    $portadaNombre,
    $estado,
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