<?php
require_once "../config/conexion.php";

$conn = Conexion::conectar();

$filtros = [];
$params = [];
$types = "";

// ======= CIUDAD =======
if (!empty($_GET['ciudad'])) {
    $filtros[] = "pf.idCiudad = ?";
    $params[] = $_GET['ciudad'];
    $types .= "i";
}

// ======= CINE =======
if (!empty($_GET['cine'])) {
    $filtros[] = "pf.idCine = ?";
    $params[] = $_GET['cine'];
    $types .= "i";
}

// ======= GÉNERO =======
if (!empty($_GET['genero'])) {
    $filtros[] = "pf.genero = ?";
    $params[] = $_GET['genero'];
    $types .= "s";
}

// ======= IDIOMA (varios checkboxes) - CORREGIDO =======
if (!empty($_GET['idioma'])) {
    $idiomas = explode(',', $_GET['idioma']);
    $placeholders = implode(',', array_fill(0, count($idiomas), '?'));
    $filtros[] = "pf.idIdioma IN ($placeholders)";
    foreach ($idiomas as $idioma) {
        $params[] = (int)$idioma;
        $types .= "i";
    }
}

// ======= FORMATO (varios checkboxes) - CORREGIDO =======
if (!empty($_GET['formato'])) {
    $formatos = explode(',', $_GET['formato']);
    $placeholders = implode(',', array_fill(0, count($formatos), '?'));
    $filtros[] = "pf.idFormato IN ($placeholders)";
    foreach ($formatos as $formato) {
        $params[] = (int)$formato;
        $types .= "i";
    }
}

// ======= CENSURA =======
if (!empty($_GET['censura'])) {
    $filtros[] = "pf.restriccionEdad = ?";
    $params[] = $_GET['censura'];
    $types .= "s";
}

// ======= DÍA =======
if (!empty($_GET['dia'])) {
    if ($_GET['dia'] === 'hoy') {
        $filtros[] = "pf.fecha = CURDATE()";
    } elseif ($_GET['dia'] === 'mañana') {
        $filtros[] = "pf.fecha = DATE_ADD(CURDATE(), INTERVAL 1 DAY)";
    } elseif ($_GET['dia'] === 'semana') {
        $filtros[] = "pf.fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)";
    }
}

// ======= SQL FINAL =======
$sql = "SELECT DISTINCT pf.* FROM peliculas_filtro pf";

if ($filtros) {
    $sql .= " WHERE " . implode(" AND ", $filtros);
}

$sql .= " ORDER BY pf.fecha ASC, pf.hora ASC";

$stmt = $conn->prepare($sql);

if ($params) {
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
