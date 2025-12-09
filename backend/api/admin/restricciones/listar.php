<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../config/conexion.php';
$conn = conexion::conectar();
$sql = "CALL restriccion_get_all()";
$result = $conn->query($sql);
$restricciones = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $restricciones[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $restricciones], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}
?>