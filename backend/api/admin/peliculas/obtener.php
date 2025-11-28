<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$sql = "SELECT * FROM PELICULA WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
    $row['id'] = (int)$row['id'];
    $row['genero'] = (int)$row['genero'];
    $row['duracion'] = (int)$row['duracion'];
    $row['restriccion'] = (int)$row['restriccion'];
    $row['restriccionComercial'] = (int)$row['restriccionComercial'];
    echo json_encode(['success' => true, 'data' => $row], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => 'No encontrado']);
}
$stmt->close();
?>