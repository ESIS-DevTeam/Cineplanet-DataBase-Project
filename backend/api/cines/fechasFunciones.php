<?php
header('Content-Type: application/json');
require_once('../../config/conexion.php');
$conn = conexion::conectar();
$id = intval($_GET['id']);
$hoy = date('Y-m-d');
$stmt = $conn->prepare("CALL public_get_fechas_funciones_por_cine(?, ?)");
$stmt->bind_param('is', $id, $hoy);
$stmt->execute();
$res = $stmt->get_result();
$fechas = [];
while ($row = $res->fetch_assoc()) {
    $fechas[] = $row['fecha'];
}
$stmt->close();
echo json_encode(['fechas' => $fechas]);
