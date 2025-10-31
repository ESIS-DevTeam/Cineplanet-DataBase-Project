<?php
require_once "../config/conexion.php";

$conn = Conexion::conectar();

$filtros = [];
$params = [];
$types = "";

// ======= CIUDAD =======
if (!empty($_GET['ciudad'])) {
    $filtros[] = "idCiudad = ?";
    $params[] = $_GET['ciudad'];
    $types .= "i";
}

// ======= CINE =======
if (!empty($_GET['cine'])) {
    $filtros[] = "idCine = ?";
    $params[] = $_GET['cine'];
    $types .= "i";
}

// ======= GÉNERO =======
if (!empty($_GET['genero'])) {
    $filtros[] = "genero = (SELECT nombre FROM GENERO WHERE id = ?)";
    $params[] = $_GET['genero'];
    $types .= "i";
}

// ======= IDIOMA (varios checkboxes) =======
if (!empty($_GET['idioma'])) {
    $idiomas = explode(',', $_GET['idioma']);
    $placeholders = implode(',', array_fill(0, count($idiomas), '?'));
    $filtros[] = "idIdioma IN ($placeholders)";
    foreach ($idiomas as $idioma) {
        $params[] = $idioma;
        $types .= "i";
    }
}

// ======= FORMATO (varios checkboxes) =======
if (!empty($_GET['formato'])) {
    $formatos = explode(',', $_GET['formato']);
    $placeholders = implode(',', array_fill(0, count($formatos), '?'));
    $filtros[] = "idFormato IN ($placeholders)";
    foreach ($formatos as $formato) {
        $params[] = $formato;
        $types .= "i";
    }
}

// ======= CENSURA =======
if (!empty($_GET['censura'])) {
    $filtros[] = "restriccionEdad = (SELECT tipo FROM RESTRICCION WHERE id = ?)";
    $params[] = $_GET['censura'];
    $types .= "i";
}

// ======= DÍA =======
if (!empty($_GET['dia'])) {
    if ($_GET['dia'] === 'hoy') {
        $filtros[] = "fecha = CURDATE()";
    } elseif ($_GET['dia'] === 'mañana') {
        $filtros[] = "fecha = DATE_ADD(CURDATE(), INTERVAL 1 DAY)";
    } elseif ($_GET['dia'] === 'semana') {
        $filtros[] = "fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)";
    }
}

// ======= SQL FINAL =======
$sql = "SELECT * FROM peliculas_filtro";
if ($filtros) {
    $sql .= " WHERE " . implode(" AND ", $filtros);
}

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
