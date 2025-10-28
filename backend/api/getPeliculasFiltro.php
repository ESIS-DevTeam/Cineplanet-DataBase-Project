<?php
require_once "../config/conexion.php";

$conn = Conexion::conectar();

// Recoge los filtros desde la query string
$filtros = [];
$params = [];

// Filtros posibles
if (!empty($_GET['ciudad'])) {
    $filtros[] = "idCiudad = ?";
    $params[] = $_GET['ciudad'];
}
if (!empty($_GET['cine'])) {
    $filtros[] = "idCine = ?";
    $params[] = $_GET['cine'];
}
if (!empty($_GET['genero'])) {
    $filtros[] = "genero = (SELECT nombre FROM GENERO WHERE id = ?)";
    $params[] = $_GET['genero'];
}
if (!empty($_GET['idioma'])) {
    $idiomas = explode(',', $_GET['idioma']);
    $placeholders = implode(',', array_fill(0, count($idiomas), '?'));
    $filtros[] = "idIdioma IN ($placeholders)";
    $params = array_merge($params, $idiomas);
}
if (!empty($_GET['formato'])) {
    $formatos = explode(',', $_GET['formato']);
    $placeholders = implode(',', array_fill(0, count($formatos), '?'));
    $filtros[] = "idFormato IN ($placeholders)";
    $params = array_merge($params, $formatos);
}
if (!empty($_GET['censura'])) {
    $filtros[] = "restriccionEdad = (SELECT tipo FROM RESTRICCION WHERE id = ?)";
    $params[] = $_GET['censura'];
}
if (!empty($_GET['dia'])) {
    // dia puede ser 'hoy', 'mañana', 'semana'
    if ($_GET['dia'] === 'hoy') {
        $filtros[] = "fecha = CURDATE()";
    } elseif ($_GET['dia'] === 'mañana') {
        $filtros[] = "fecha = DATE_ADD(CURDATE(), INTERVAL 1 DAY)";
    } elseif ($_GET['dia'] === 'semana') {
        $filtros[] = "fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)";
    }
}

// Construye el SQL
$sql = "SELECT * FROM peliculas_filtro";
if ($filtros) {
    $sql .= " WHERE " . implode(" AND ", $filtros);
}

$stmt = $conn->prepare($sql);

// Vincula los parámetros si hay
if ($params) {
    $types = str_repeat('s', count($params));
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$peliculas = [];
while ($row = $result->fetch_assoc()) {
    $peliculas[] = $row;
}

header("Content-Type: application/json");
echo json_encode($peliculas);
?>
