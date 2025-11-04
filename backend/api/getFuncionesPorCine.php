<?php
require_once "../config/conexion.php";

$conn = Conexion::conectar();

$idPelicula = isset($_GET['idPelicula']) ? $_GET['idPelicula'] : null;
$idCine = isset($_GET['idCine']) ? $_GET['idCine'] : null;

if (!$idPelicula || !$idCine) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan parámetros 'idPelicula' o 'idCine'."]);
    exit;
}

// Usar la vista peliculas_filtro para extraer formatos, horas y idiomas por cine y película
$sql = "SELECT 
            fecha,
            hora,
            formato,
            idioma
        FROM peliculas_filtro
        WHERE idPelicula = ? AND idCine = ?
        ORDER BY fecha, hora, formato, idioma";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $idPelicula, $idCine);
$stmt->execute();
$result = $stmt->get_result();

$funcionesPorFecha = [];

while ($row = $result->fetch_assoc()) {
    $fecha = $row['fecha'];
    if (!isset($funcionesPorFecha[$fecha])) {
        $funcionesPorFecha[$fecha] = [];
    }
    $funcionesPorFecha[$fecha][] = [
        "hora" => $row['hora'],
        "formato" => $row['formato'],
        "idioma" => $row['idioma']
    ];
}

header("Content-Type: application/json");
echo json_encode($funcionesPorFecha);
?>
