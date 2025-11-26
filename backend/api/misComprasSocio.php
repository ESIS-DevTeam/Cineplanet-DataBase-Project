<?php
session_start();
require_once '../config/conexion.php';

header('Content-Type: application/json');

$idUsuario = null;
if (isset($_GET['id'])) {
    $idUsuario = intval($_GET['id']);
} elseif (isset($_SESSION['socio']['id'])) {
    $idUsuario = $_SESSION['socio']['id'];
}

if (!$idUsuario) {
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

$conn = conexion::conectar();

// Consulta todas las boletas del usuario, tengan función, productos o ambos
$sql = "
SELECT
    b.id AS idCompra,
    COALESCE(p.nombre, 'Solo Dulcería') AS pelicula,
    b.fecha,
    COALESCE(c.nombre, 'Dulcería') AS cine,
    IFNULL(tickets.tickets, 0) AS tickets,
    IFNULL(prod.puntosExtra, 0) AS puntosExtra
FROM BOLETA b
LEFT JOIN (
    SELECT ba.idBoleta, COUNT(ba.id) AS tickets
    FROM BOLETA_ASIENTO ba
    GROUP BY ba.idBoleta
) tickets ON tickets.idBoleta = b.id
LEFT JOIN (
    SELECT pb.idBoleta, SUM(pb.subtotal)*0.10 AS puntosExtra
    FROM PRODUCTOS_BOLETA pb
    GROUP BY pb.idBoleta
) prod ON prod.idBoleta = b.id
LEFT JOIN BOLETA_ASIENTO ba ON ba.idBoleta = b.id
LEFT JOIN FUNCION f ON ba.idFuncion = f.id
LEFT JOIN PELICULA p ON f.idPelicula = p.id
LEFT JOIN SALA s ON f.idSala = s.id
LEFT JOIN CINE c ON s.idCine = c.id
WHERE b.idUsuario = ?
GROUP BY b.id, p.nombre, b.fecha, c.nombre, tickets.tickets, prod.puntosExtra
ORDER BY b.fecha DESC
";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $idUsuario);
$stmt->execute();
$result = $stmt->get_result();

$compras = [];
while ($row = $result->fetch_assoc()) {
    $puntos = intval($row['tickets']) + floatval($row['puntosExtra']);
    $compras[] = [
        'idCompra' => $row['idCompra'],
        'pelicula' => $row['pelicula'],
        'fecha' => $row['fecha'],
        'cine' => $row['cine'],
        'puntos' => round($puntos, 2),
        'visitas' => ($row['tickets'] > 0 ? 1 : 0) // visita solo si hay ticket de función
    ];
}
echo json_encode(['compras' => $compras]);

$stmt->close();
$conn->close();
?>
