<?php
require_once("../config/conexion.php");
header('Content-Type: application/json');

$conn = conexion::conectar();

$idFuncion = isset($_GET['funcion']) ? intval($_GET['funcion']) : null;
$idPelicula = isset($_GET['pelicula']) ? intval($_GET['pelicula']) : null;
$asientos = isset($_GET['asientos']) ? $_GET['asientos'] : '';
$promos = isset($_GET['promos']) ? $_GET['promos'] : '';
$productos = isset($_GET['productos']) ? $_GET['productos'] : '';

$resumen = [
    "pelicula" => null,
    "funcion" => null,
    "asientos" => [],
    "entradas" => [],
    "dulceria" => [],
    "totalEntradas" => 0,
    "totalDulceria" => 0,
    "total" => 0
];

// Película
if ($idPelicula) {
    $sql = "SELECT nombre FROM PELICULA WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $idPelicula);
    $stmt->execute();
    $stmt->bind_result($nombrePelicula);
    if ($stmt->fetch()) {
        $resumen["pelicula"] = $nombrePelicula;
    }
    $stmt->close();
}

// Función
if ($idFuncion) {
    $sql = "SELECT F.id, F.fecha, F.hora, S.nombre as sala, C.nombre as cine
            FROM FUNCION F
            JOIN SALA S ON F.idSala = S.id
            JOIN CINE C ON S.idCine = C.id
            WHERE F.id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $idFuncion);
    $stmt->execute();
    $stmt->bind_result($fid, $fecha, $hora, $sala, $cine);
    if ($stmt->fetch()) {
        $resumen["funcion"] = [
            "id" => $fid,
            "fecha" => $fecha,
            "hora" => $hora,
            "sala" => $sala,
            "cine" => $cine
        ];
    }
    $stmt->close();
}

// Asientos
if ($asientos) {
    $ids = array_filter(explode(',', $asientos));
    if (count($ids) > 0) {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $types = str_repeat('i', count($ids));
        $sql = "SELECT fila, numero FROM PLANO_SALA WHERE id IN ($placeholders)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...array_map('intval', $ids));
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $resumen["asientos"][] = $row["fila"] . $row["numero"];
        }
        $stmt->close();
    }
}

// Promos/Entradas
if ($promos) {
    $promosArr = explode(',', $promos);
    // Obtener precio base de la función (solo una vez)
    $precioFuncion = 0;
    if ($idFuncion) {
        $sql = "SELECT precio FROM FUNCION WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $idFuncion);
        $stmt->execute();
        $stmt->bind_result($precioFuncionTmp);
        if ($stmt->fetch()) {
            $precioFuncion = floatval($precioFuncionTmp);
        }
        $stmt->close();
    }

    foreach ($promosArr as $promoStr) {
        list($id, $cantidad) = explode(':', $promoStr);
        $id = intval($id);
        $cantidad = intval($cantidad);
        $sql = "SELECT nombre, descripcion, tipo, valor FROM PROMO WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->bind_result($nombre, $descripcion, $tipoPromo, $valorPromo);
        if ($stmt->fetch()) {
            // Calcula el precio final según tipo
            $precioFinal = 0;
            if ($tipoPromo === 'fijo') {
                $precioFinal = floatval($valorPromo);
            } elseif ($tipoPromo === 'porcentaje') {
                // Aplica descuento sobre el precio de la función
                $descuento = $precioFuncion * (floatval($valorPromo) / 100.0);
                $precioFinal = $precioFuncion - $descuento;
            }
            $subtotal = $precioFinal * $cantidad;
            $resumen["entradas"][] = [
                "nombre" => $nombre,
                "descripcion" => $descripcion,
                "cantidad" => $cantidad,
                "precio" => round($precioFinal, 2),
                "subtotal" => round($subtotal, 2)
            ];
            $resumen["totalEntradas"] += $subtotal;
        }
        $stmt->close();
    }
}

// Dulcería
if ($productos) {
    $productosArr = explode(',', $productos);
    foreach ($productosArr as $prodStr) {
        // Solo procesa si tiene el formato id-cantidad
        if (strpos($prodStr, '-') === false) continue;
        list($id, $cantidad) = explode('-', $prodStr);
        $id = intval($id);
        $cantidad = intval($cantidad);
        if ($id <= 0 || $cantidad <= 0) continue;
        $sql = "SELECT nombre, descripcion, precio FROM PRODUCTO WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->bind_result($nombre, $descripcion, $precio);
        if ($stmt->fetch()) {
            $precioFloat = floatval($precio); // Convertir precio a float
            $subtotal = $precioFloat * $cantidad;
            $resumen["dulceria"][] = [
                "nombre" => $nombre,
                "descripcion" => $descripcion,
                "cantidad" => $cantidad,
                "precio" => $precioFloat, // Usar el precio convertido
                "subtotal" => $subtotal
            ];
            $resumen["totalDulceria"] += $subtotal;
        }
        $stmt->close();
    }
}

$resumen["total"] = $resumen["totalEntradas"] + $resumen["totalDulceria"];

echo json_encode($resumen);
?>
