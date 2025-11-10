<?php
require_once("../config/conexion.php");

header('Content-Type: application/json');

$idPromo = isset($_GET['idPromo']) ? intval($_GET['idPromo']) : 0;
$idUsuario = isset($_GET['idUsuario']) ? intval($_GET['idUsuario']) : 0;

if ($idPromo <= 0 || $idUsuario <= 0) {
    echo json_encode(['error' => 'Faltan parámetros']);
    exit;
}

$conn = conexion::conectar();

// 1. Obtener el stock total de la promo
$stmt = $conn->prepare("SELECT tieneStock, stock FROM PROMO WHERE id = ?");
$stmt->bind_param("i", $idPromo);
$stmt->execute();
$res = $stmt->get_result();
$promo = $res->fetch_assoc();
$stmt->close();

if (!$promo || !$promo['tieneStock']) {
    echo json_encode(['error' => 'La promoción no tiene stock limitado']);
    exit;
}

$stockTotal = $promo['stock'];

// 2. Buscar registro de uso del usuario para esa promo
$stmt = $conn->prepare("SELECT cantidad FROM PROMO_USO WHERE idPromo = ? AND idUsuario = ?");
$stmt->bind_param("ii", $idPromo, $idUsuario);
$stmt->execute();
$res = $stmt->get_result();
$uso = $res->fetch_assoc();
$stmt->close();

if (!$uso) {
    // Si no existe, crear registro con cantidad 0
    $stmt = $conn->prepare("INSERT INTO PROMO_USO (idPromo, idUsuario, cantidad) VALUES (?, ?, 0)");
    $stmt->bind_param("ii", $idPromo, $idUsuario);
    $stmt->execute();
    $stmt->close();
    $cantidadUsada = 0;
} else {
    $cantidadUsada = intval($uso['cantidad']);
}

// 3. Calcular stock disponible
$stockDisponible = max(0, $stockTotal - $cantidadUsada);

echo json_encode([
    'stockTotal' => $stockTotal,
    'cantidadUsada' => $cantidadUsada,
    'stockDisponible' => $stockDisponible
]);
?>
