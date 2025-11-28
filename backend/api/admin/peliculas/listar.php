<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();

$sql = "SELECT p.*, g.nombre AS genero_nombre, r.nombre AS restriccion_nombre FROM PELICULA p
        JOIN GENERO g ON p.genero = g.id
        JOIN RESTRICCION r ON p.restriccion = r.id";
$result = $conn->query($sql);
$peliculas = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['genero'] = (int)$row['genero'];
        $row['duracion'] = (int)$row['duracion'];
        $row['restriccion'] = (int)$row['restriccion'];
        $row['restriccionComercial'] = (int)$row['restriccionComercial'];
        $peliculas[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $peliculas], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}
?>