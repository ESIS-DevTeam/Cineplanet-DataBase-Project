<?php
require_once("../config/conexion.php");
header('Content-Type: application/json');

$idPromo = $_GET['idPromo'] ?? null;
$idFuncion = $_GET['idFuncion'] ?? null;

if (!$idPromo || !$idFuncion) {
    echo json_encode(['error' => 'Faltan parámetros']);
    exit;
}

$conn = conexion::conectar();

// Obtener detalle de la promo
$stmt = $conn->prepare("SELECT nombre, descripcion, tipo, valor FROM PROMO WHERE id=?");
$stmt->bind_param("i", $idPromo);
$stmt->execute();
$res = $stmt->get_result();
$promo = $res->fetch_assoc();

if (!$promo) {
    echo json_encode(['error' => 'Promo no encontrada']);
    exit;
}

// Obtener precio base de la función
$stmt2 = $conn->prepare("SELECT precio FROM FUNCION WHERE id=?");
$stmt2->bind_param("i", $idFuncion);
$stmt2->execute();
$res2 = $stmt2->get_result();
$funcion = $res2->fetch_assoc();

if (!$funcion) {
    echo json_encode(['error' => 'Función no encontrada']);
    exit;
}

$precioBase = floatval($funcion['precio']);
$descuento = 0;

// Calcular descuento
if ($promo['tipo'] === 'porcentaje') {
    $descuento = $precioBase * (floatval($promo['valor']) / 100);
} else {
    $descuento = floatval($promo['valor']);
}
if ($descuento > $precioBase) $descuento = $precioBase;

echo json_encode([
    'detalle' => $promo['nombre'] . ($promo['descripcion'] ? ' - ' . $promo['descripcion'] : ''),
    'montoDescuento' => round($descuento, 2)
]);
?>
