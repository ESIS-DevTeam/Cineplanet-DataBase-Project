<?php
require_once '../config/conexion.php';

header('Content-Type: application/json');

$idProducto = isset($_GET['idProducto']) ? intval($_GET['idProducto']) : 0;
if ($idProducto <= 0) {
    echo json_encode(['error' => 'ID de producto inválido']);
    exit;
}

$conn = conexion::conectar();
$stmt = $conn->prepare('SELECT nombre FROM PRODUCTO WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $idProducto);
$stmt->execute();
$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
    echo json_encode(['nombre' => $row['nombre']]);
} else {
    echo json_encode(['error' => 'Producto no encontrado']);
}
$stmt->close();
