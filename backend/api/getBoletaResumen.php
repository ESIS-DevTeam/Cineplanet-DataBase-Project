<?php
require_once '../config/conexion.php';

header('Content-Type: application/json');

$idBoleta = isset($_GET['idBoleta']) ? intval($_GET['idBoleta']) : 0;
if (!$idBoleta) {
    echo json_encode(['error' => 'ID de boleta requerido']);
    exit;
}

$conn = conexion::conectar();

// Obtén el idFuncion de la boleta si existe
$sqlFuncion = "SELECT ba.idFuncion FROM BOLETA_ASIENTO ba WHERE ba.idBoleta = ? LIMIT 1";
$stmtFuncion = $conn->prepare($sqlFuncion);
$stmtFuncion->bind_param('i', $idBoleta);
$stmtFuncion->execute();
$resFuncion = $stmtFuncion->get_result();
$idFuncion = null;
if ($rowFuncion = $resFuncion->fetch_assoc()) {
    $idFuncion = $rowFuncion['idFuncion'];
}
$stmtFuncion->close();

// Si existe idFuncion, obtén cine y ciudad por la función
$nombreCine = null;
$nombreCiudad = null;
if ($idFuncion) {
    $sqlCineCiudad = "SELECT c.nombre AS cine, ciu.nombre AS ciudad
        FROM FUNCION f
        INNER JOIN SALA s ON f.idSala = s.id
        INNER JOIN CINE c ON s.idCine = c.id
        LEFT JOIN CIUDAD ciu ON c.idCiudad = ciu.id
        WHERE f.id = ?";
    $stmtCineCiudad = $conn->prepare($sqlCineCiudad);
    $stmtCineCiudad->bind_param('i', $idFuncion);
    $stmtCineCiudad->execute();
    $resCineCiudad = $stmtCineCiudad->get_result();
    if ($rowCC = $resCineCiudad->fetch_assoc()) {
        $nombreCine = $rowCC['cine'];
        $nombreCiudad = $rowCC['ciudad'];
    }
    $stmtCineCiudad->close();
}

// Consulta boleta principal y usuario
$sqlBoleta = "SELECT b.id, b.fecha, b.total, b.subtotal, b.descuentoTotal, u.nombre AS nombreCliente, u.email, u.numeroDocumento
    FROM BOLETA b
    INNER JOIN USUARIO u ON b.idUsuario = u.id
    WHERE b.id = ?";
$stmt = $conn->prepare($sqlBoleta);
$stmt->bind_param('i', $idBoleta);
$stmt->execute();
$resBoleta = $stmt->get_result();
$boleta = $resBoleta->fetch_assoc();
$stmt->close();

if (!$boleta) {
    echo json_encode(['error' => 'Boleta no encontrada']);
    $conn->close();
    exit;
}

// Consulta productos (dulcería)
$sqlProd = "SELECT pb.cantidad, pr.nombre, pr.descripcion, pb.precioUnitario, pb.subtotal
    FROM PRODUCTOS_BOLETA pb
    INNER JOIN PRODUCTO pr ON pb.idProducto = pr.id
    WHERE pb.idBoleta = ?";
$stmtProd = $conn->prepare($sqlProd);
$stmtProd->bind_param('i', $idBoleta);
$stmtProd->execute();
$resProd = $stmtProd->get_result();
$productos = [];
while ($row = $resProd->fetch_assoc()) {
    $productos[] = $row;
}
$stmtProd->close();

// Consulta asientos (si existen)
$sqlAsientos = "SELECT 
    ps.fila, 
    ps.numero, 
    ba.precioUnitario, 
    f.fecha, 
    f.hora, 
    p.nombre AS nombrePelicula, 
    s.nombre AS nombreSala
FROM BOLETA_ASIENTO ba
INNER JOIN FUNCION f ON ba.idFuncion = f.id
INNER JOIN PELICULA p ON f.idPelicula = p.id
INNER JOIN SALA s ON f.idSala = s.id
INNER JOIN PLANO_SALA ps ON ba.idPlanoSala = ps.id
WHERE ba.idBoleta = ?";
$stmtAsientos = $conn->prepare($sqlAsientos);
$stmtAsientos->bind_param('i', $idBoleta);
$stmtAsientos->execute();
$resAsientos = $stmtAsientos->get_result();
$asientos = [];
while ($row = $resAsientos->fetch_assoc()) {
    $asientos[] = [
        'asiento' => $row['fila'] . $row['numero'],
        'precioUnitario' => $row['precioUnitario'],
        'fecha' => $row['fecha'],
        'hora' => $row['hora'],
        'nombrePelicula' => $row['nombrePelicula'],
        'nombreSala' => $row['nombreSala']
    ];
}
$stmtAsientos->close();

// Consulta promos (si existen)
$sqlPromos = "SELECT pb.cantidad, pr.nombre, pb.montoDescuento, pb.detalle
    FROM PROMO_BOLETA pb
    INNER JOIN PROMO pr ON pb.idPromo = pr.id
    WHERE pb.idBoleta = ?";
$stmtPromos = $conn->prepare($sqlPromos);
$stmtPromos->bind_param('i', $idBoleta);
$stmtPromos->execute();
$resPromos = $stmtPromos->get_result();
$promos = [];
while ($row = $resPromos->fetch_assoc()) {
    $promos[] = $row;
}
$stmtPromos->close();

$conn->close();

// Detecta tipo de compra y arma los datos necesarios
if (count($asientos) > 0) {
    // Compra completa (función)
    $result = [
        'tipo' => 'completa',
        'boleta' => [
            'id' => $boleta['id'],
            'fecha' => $boleta['fecha'],
            'nombreCliente' => $boleta['nombreCliente'],
            'cine' => $nombreCine ?? 'Cineplanet',
            'ciudad' => $nombreCiudad ?? '',
            'hora' => $asientos[0]['hora'] ?? '',
            'sala' => $asientos[0]['nombreSala'] ?? '',
            'asientos' => array_map(function($a) { return $a['asiento']; }, $asientos),
            'nombrePelicula' => $asientos[0]['nombrePelicula'] ?? '',
            'total' => $boleta['total'],
            'subtotal' => $boleta['subtotal'],
            'descuentoTotal' => $boleta['descuentoTotal']
        ],
        'productos' => $productos,
        'asientos' => $asientos,
        'promos' => $promos
    ];
} else {
    // Solo productos (dulcería)
    $result = [
        'tipo' => 'dulceria',
        'boleta' => [
            'id' => $boleta['id'],
            'fecha' => $boleta['fecha'],
            'nombreCliente' => $boleta['nombreCliente'],
            // No incluir cine ni ciudad
            'total' => $boleta['total'],
            'subtotal' => $boleta['subtotal'],
            'descuentoTotal' => $boleta['descuentoTotal']
        ],
        'productos' => $productos,
        'asientos' => [],
        'promos' => $promos
    ];
}

echo json_encode($result);
?>
