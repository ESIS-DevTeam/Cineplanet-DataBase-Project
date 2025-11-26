<?php
session_start();
require_once '../config/conexion.php';

header('Content-Type: application/json');

// Cambia a 'id' para que coincida con la base de datos y lo que envías
$id = null;
if (isset($_POST['id'])) {
    $id = intval($_POST['id']);
} elseif (isset($_GET['id'])) {
    $id = intval($_GET['id']);
} elseif (isset($_SESSION['idUsuario'])) {
    $id = $_SESSION['idUsuario'];
}

if (!$id) {
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

$conn = conexion::conectar();

$sql = "SELECT grado, visitas, puntos FROM SOCIO WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
    echo json_encode([
        'grado' => $row['grado'],
        'visitas' => intval($row['visitas']),
        'puntos' => intval($row['puntos'])
    ]);
} else {
    echo json_encode(['error' => 'Socio no encontrado']);
}
$stmt->close();
$conn->close();
?>
