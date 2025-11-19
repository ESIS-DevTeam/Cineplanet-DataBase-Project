<?php
require_once '../config/conexion.php';

header('Content-Type: application/json');

$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : null;
if (!$tipo) {
    echo json_encode([]);
    exit;
}

$conn = conexion::conectar();

$stmt = $conn->prepare("SELECT * FROM PRODUCTO WHERE estado = 'activo' AND tipo = ?");
$stmt->bind_param("s", $tipo);
$stmt->execute();
$result = $stmt->get_result();

$productos = [];
while ($row = $result->fetch_assoc()) {
    $productos[] = $row;
}

echo json_encode($productos);
?>
