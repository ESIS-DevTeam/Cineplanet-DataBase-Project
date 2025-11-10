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

// Obtener restriccionComercial de la película de la función
$restriccionComercial = 0;
$stmtRestriccion = $conn->prepare("SELECT p.restriccionComercial FROM FUNCION f JOIN PELICULA p ON f.idPelicula = p.id WHERE f.id = ?");
$stmtRestriccion->bind_param("i", $idFuncion);
$stmtRestriccion->execute();
$resRestriccion = $stmtRestriccion->get_result();
if ($rowRestriccion = $resRestriccion->fetch_assoc()) {
    $restriccionComercial = intval($rowRestriccion['restriccionComercial']);
}
$stmtRestriccion->close();

// Obtener promociones activas (agrega aplicaRestriccion al SELECT)
$promos = [];
$stmtPromo = $conn->prepare("SELECT id, nombre, descripcion, tipo, valor, aplicaA, requiereSocio, gradoMinimo, requiereEmpleado, combinable, requierePuntos, puntosNecesarios, estado, tieneStock, stock, aplicaRestriccion FROM PROMO WHERE estado = 'activa'");
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

    // Verifica aplicaRestriccion
    if ($row['aplicaRestriccion']) {
        if ($restriccionComercial == 1) {
            $mostrar = false;
        }
    }

    if ($mostrar) {
        // Aplica descuento sobre el precio base de la función
        $precioFinal = $precioBase;
        if ($row['tipo'] == 'porcentaje') {
            $precioFinal = $precioBase * (1 - floatval($row['valor']) / 100);
        } else if ($row['tipo'] == 'fijo') {
            $precioFinal = floatval($row['valor']);
        }
        // Al construir el array de promociones, asegúrate de incluir los campos de stock:
        $promos[] = [
            'id' => $row['id'],
            'nombre' => $row['nombre'],
            'descripcion' => $row['descripcion'],
            'tipo' => $row['tipo'],
            'valor' => floatval($row['valor']),
            'aplicaA' => $row['aplicaA'],
            'requiereSocio' => intval($row['requiereSocio']),
            'gradoMinimo' => $row['gradoMinimo'],
            'requiereEmpleado' => intval($row['requiereEmpleado']),
            'combinable' => intval($row['combinable']),
            'requierePuntos' => intval($row['requierePuntos']),
            'puntosNecesarios' => $row['puntosNecesarios'] !== null ? intval($row['puntosNecesarios']) : null,
            'estado' => $row['estado'],
            'tieneStock' => intval($row['tieneStock']),
            'stock' => $row['stock'] !== null ? intval($row['stock']) : null,
            'aplicaRestriccion' => intval($row['aplicaRestriccion']),
            'precioFinal' => floatval($precioFinal)
        ];
    }
}
$stmtPromo->close();

echo json_encode([
    'promos' => $promos,
    'precioBase' => $precioBase
]);
?>
