<?php
require_once '../config/conexion.php';
session_start();

$idFuncion = $_GET['idFuncion'] ?? null;
$socio = isset($_GET['socio']) && $_GET['socio'] == '1' && isset($_SESSION['socio']) ? $_SESSION['socio'] : null;

$conn = conexion::conectar();

// Obtener precio base de la función
$precioBase = 0;
$stmtPrecio = $conn->prepare("SELECT precio FROM FUNCION WHERE id = ?");
$stmtPrecio->bind_param("i", $idFuncion);
$stmtPrecio->execute();
$resPrecio = $stmtPrecio->get_result();
if ($rowPrecio = $resPrecio->fetch_assoc()) {
    $precioBase = floatval($rowPrecio['precio']);
}
$stmtPrecio->close();

// Obtener promociones activas
$promos = [];
$stmtPromo = $conn->prepare("SELECT id, nombre, descripcion, tipo, valor, requiereSocio, gradoMinimo, requiereEmpleado, requierePuntos, puntosNecesarios FROM PROMO WHERE estado = 'activa'");
$stmtPromo->execute();
$resPromo = $stmtPromo->get_result();
while ($row = $resPromo->fetch_assoc()) {
    // Filtra promos según requisitos
    $mostrar = false;
    if ($row['requiereSocio']) {
        if ($socio) $mostrar = true;
    } else {
        $mostrar = true;
    }
    // Puedes agregar más lógica para gradoMinimo, empleado, puntos, etc.

    if ($mostrar) {
        // Aplica descuento sobre el precio base de la función
        $precioFinal = $precioBase;
        if ($row['tipo'] == 'porcentaje') {
            $precioFinal = $precioBase * (1 - floatval($row['valor']) / 100);
        } else if ($row['tipo'] == 'fijo') {
            $precioFinal = floatval($row['valor']);
        }
        $promos[] = [
            'id' => $row['id'],
            'nombre' => $row['nombre'],
            'descripcion' => $row['descripcion'],
            'precioFinal' => $precioFinal
        ];
    }
}
$stmtPromo->close();

echo json_encode([
    'promos' => $promos,
    'precioBase' => $precioBase
]);
?>
