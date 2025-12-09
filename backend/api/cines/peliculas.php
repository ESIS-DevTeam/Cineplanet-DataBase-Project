<?php
require_once('../../config/conexion.php');
header('Content-Type: application/json');
$conn = conexion::conectar();
$id = intval($_GET['id']);
$hoy = date('Y-m-d');
$stmt = $conn->prepare("CALL public_get_peliculas_por_cine(?, ?)");
$stmt->bind_param('is', $id, $hoy);
$stmt->execute();
$res = $stmt->get_result();
$peliculas = [];
while ($row = $res->fetch_assoc()) {
    $row['duracionStr'] = $row['duracion'] ? (int)($row['duracion']/60) . 'h ' . ($row['duracion']%60) . 'min' : '';
    $peliculas[] = $row;
}
$stmt->close();
echo json_encode(['peliculas' => $peliculas]);
