<?php
require_once("../config/conexion.php");
header('Content-Type: application/json');

$idProducto = $_GET['idProducto'] ?? null;

if (!$idProducto) {
    echo json_encode(['error' => 'Falta idProducto']);
    exit;
}

$conn = conexion::conectar();

$stmt = $conn->prepare("SELECT nombre, descripcion, precio FROM PRODUCTO WHERE id=?");
$stmt->bind_param("i", $idProducto);
$stmt->execute();
$res = $stmt->get_result();
$producto = $res->fetch_assoc();

if (!$producto) {
    echo json_encode(['error' => 'Producto no encontrado']);
    exit;
}

echo json_encode([
    'detalle' => $producto['nombre'] . ($producto['descripcion'] ? ' - ' . $producto['descripcion'] : ''),
    'precioUnitario' => floatval($producto['precio'])
]);
?>
