<?php
require_once "../config/conexion.php";

$conn = Conexion::conectar();

$idPelicula = isset($_GET['idPelicula']) ? $_GET['idPelicula'] : null;
if (!$idPelicula) {
    http_response_code(400);
    echo json_encode(["error" => "Falta el parámetro 'idPelicula'."]);
    exit;
}

// Usar la vista peliculas_filtro para obtener datos principales y idiomas/formatos
$sql = "SELECT 
    nombrePelicula,
    portada,
    trailer,
    genero,
    duracion,
    restriccionEdad,
    sinopsis,
    GROUP_CONCAT(DISTINCT idioma) AS idiomas,
    GROUP_CONCAT(DISTINCT formato) AS formatos
FROM peliculas_filtro
WHERE idPelicula = ?
GROUP BY idPelicula, nombrePelicula, portada, trailer, genero, duracion, restriccionEdad, sinopsis";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idPelicula);
$stmt->execute();
$result = $stmt->get_result();
$pelicula = $result->fetch_assoc();
$stmt->close();

if (!$pelicula) {
    echo json_encode([]);
    exit;
}

// Convertir idiomas y formatos a array
$pelicula['idiomas'] = $pelicula['idiomas'] ? explode(',', $pelicula['idiomas']) : [];
$pelicula['formatos'] = $pelicula['formatos'] ? explode(',', $pelicula['formatos']) : [];

header("Content-Type: application/json");
echo json_encode($pelicula);
?>
