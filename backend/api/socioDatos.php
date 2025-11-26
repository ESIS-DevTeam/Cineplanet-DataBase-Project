<?php
require_once("../config/conexion.php");
header('Content-Type: application/json');

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

$conn = conexion::conectar();
$sql = "SELECT 
    u.nombre AS nombreCompleto,
    u.tipoDocumento,
    u.numeroDocumento,
    s.fechaNacimiento,
    s.genero,
    s.celular,
    s.departamento,
    s.provincia,
    s.distrito,
    s.cineplanetFavorito,
    u.email,
    s.grado,
    s.visitas,
    s.puntos
FROM USUARIO u
JOIN SOCIO s ON u.id = s.id
WHERE u.id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();
if ($row = $res->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode(['error' => 'Socio no encontrado']);
}
