<?php
require_once '../config/conexion.php';

header('Content-Type: application/json');

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

$conn = conexion::conectar();

// Obtener grado y si es empleado
$res = $conn->query("SELECT grado, empleado FROM SOCIO WHERE id=$id");
if (!$res || $res->num_rows == 0) {
    echo json_encode(['error' => 'Socio no encontrado']);
    exit;
}
$rowSocio = $res->fetch_assoc();
$grado = $rowSocio['grado'];
$esEmpleado = isset($rowSocio['empleado']) && $rowSocio['empleado'] == 1;

// Orden de grados para comparación
$grados = ['clasico', 'plata', 'oro', 'black'];
$gradoIndex = array_search($grado, $grados);

// Beneficios de entradas (PROMO)
$entradas = [];
$sqlEntradas = "
    SELECT nombre, descripcion, requierePuntos, puntosNecesarios, tieneStock, stock, gradoMinimo, requiereEmpleado
    FROM PROMO
    WHERE estado='activa'
      AND aplicaA IN ('funciones','todo')
      AND requiereSocio=1
    ORDER BY nombre
";
$resEntradas = $conn->query($sqlEntradas);
while ($row = $resEntradas->fetch_assoc()) {
    // Excluir promos de empleado si no es empleado
    if (!$esEmpleado && isset($row['requiereEmpleado']) && $row['requiereEmpleado'] == 1) {
        continue;
    }
    // Si gradoMinimo es NULL, aplica a todos los socios
    if (is_null($row['gradoMinimo'])) {
        $entradas[] = $row;
    } else {
        $promoGradoIndex = array_search($row['gradoMinimo'], $grados);
        // El socio puede acceder si su grado es igual o superior al gradoMinimo de la promo
        if ($gradoIndex !== false && $promoGradoIndex !== false && $gradoIndex >= $promoGradoIndex) {
            $entradas[] = $row;
        }
    }
}

// Beneficios de dulcería (PRODUCTO)
$dulceria = [];
$sqlDulceria = "
    SELECT nombre, descripcion, precio, tipo, canjeaPuntos, puntosNecesarios, gradoMinimo, requiereEmpleado
    FROM PRODUCTO
    WHERE estado='activo'
      AND requiereSocio=1
    ORDER BY nombre
";
$resDulceria = $conn->query($sqlDulceria);
while ($row = $resDulceria->fetch_assoc()) {
    // Excluir productos de empleado si no es empleado
    if (!$esEmpleado && isset($row['requiereEmpleado']) && $row['requiereEmpleado'] == 1) {
        continue;
    }
    if (is_null($row['gradoMinimo'])) {
        $dulceria[] = $row;
    } else {
        $prodGradoIndex = array_search($row['gradoMinimo'], $grados);
        if ($gradoIndex !== false && $prodGradoIndex !== false && $gradoIndex >= $prodGradoIndex) {
            $dulceria[] = $row;
        }
    }
}

// Beneficios exclusivos de empleado
$beneficiosEmpleado = [];
if ($esEmpleado === true) {
    // PROMO para empleados
    $sqlPromoEmp = "
        SELECT nombre, descripcion, requierePuntos, puntosNecesarios, tieneStock, stock
        FROM PROMO
        WHERE estado='activa'
          AND requiereEmpleado=1
        ORDER BY nombre
    ";
    $resPromoEmp = $conn->query($sqlPromoEmp);
    while ($row = $resPromoEmp->fetch_assoc()) {
        $beneficiosEmpleado[] = $row;
    }
    // PRODUCTO para empleados
    $sqlProdEmp = "
        SELECT nombre, descripcion, precio, tipo, canjeaPuntos, puntosNecesarios
        FROM PRODUCTO
        WHERE estado='activo'
          AND requiereEmpleado=1
        ORDER BY nombre
    ";
    $resProdEmp = $conn->query($sqlProdEmp);
    while ($row = $resProdEmp->fetch_assoc()) {
        $beneficiosEmpleado[] = $row;
    }
}

// Construir respuesta
$response = [
    'entradas' => $entradas,
    'dulceria' => $dulceria,
    'grado' => $grado,
    'esEmpleado' => $esEmpleado
];

if ($esEmpleado === true) {
    $response['empleado'] = $beneficiosEmpleado;
}

echo json_encode($response);
