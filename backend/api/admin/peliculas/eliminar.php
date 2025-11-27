<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$stmt = $conn->prepare("DELETE FROM PELICULA WHERE id = ?");
$stmt->bind_param('i', $id);
$success = $stmt->execute();
if ($success) {
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
?>