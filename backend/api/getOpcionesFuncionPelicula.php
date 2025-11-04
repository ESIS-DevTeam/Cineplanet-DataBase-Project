<?php
require_once "../config/conexion.php";

$conn = Conexion::conectar();

$idPelicula = isset($_GET['pelicula']) ? $_GET['pelicula'] : null;
if (!$idPelicula) {
    http_response_code(400);
    echo json_encode(["error" => "Falta el parámetro 'pelicula'."]);
    exit;
}

$sql = "SELECT DISTINCT ciudad, idCiudad, nombreCine, idCine, fecha
        FROM peliculas_filtro
        WHERE idPelicula = ?
        ORDER BY ciudad, nombreCine, fecha";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idPelicula);
$stmt->execute();
$result = $stmt->get_result();

$ciudades = [];
$cines = [];
$fechas = [];

while ($row = $result->fetch_assoc()) {
    if ($row['idCiudad'] && $row['ciudad']) {
        $ciudades[$row['idCiudad']] = $row['ciudad'];
    }
    if ($row['idCine'] && $row['nombreCine']) {
        // Guardar también idCiudad en cada cine
        $cines[$row['idCine']] = [
            "id" => $row['idCine'],
            "nombre" => $row['nombreCine'],
            "idCiudad" => $row['idCiudad']
        ];
    }
    if ($row['fecha']) {
        $fechas[$row['fecha']] = $row['fecha'];
    }
}

$response = [
    "ciudades" => [],
    "cines" => [],
    "fechas" => []
];

foreach ($ciudades as $id => $nombre) {
    $response["ciudades"][] = ["id" => $id, "nombre" => $nombre];
}
// Cambia aquí para que cines sea un array de objetos con id, nombre, idCiudad
foreach ($cines as $cine) {
    $response["cines"][] = $cine;
}
foreach ($fechas as $fecha) {
    $response["fechas"][] = $fecha;
}

header("Content-Type: application/json");
echo json_encode($response);
?>
