<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();
$sql = "SELECT id, nombre FROM GENERO";
$result = $conn->query($sql);
$generos = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $generos[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $generos], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}
?>