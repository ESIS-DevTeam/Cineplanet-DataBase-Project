<?php
header('Content-Type: application/json');
require_once('../../config/conexion.php');
$conn = conexion::conectar();
$id = intval($_GET['id']);
$hoy = date('Y-m-d');
$sql = "SELECT DISTINCT f.fecha
        FROM FUNCION f
        JOIN SALA s ON f.idSala = s.id
        WHERE s.idCine = $id AND f.estado = 'activa' AND f.fecha >= '$hoy'
        ORDER BY f.fecha ASC";
$res = $conn->query($sql);
$fechas = [];
while ($row = $res->fetch_assoc()) {
    $fechas[] = $row['fecha'];
}
echo json_encode(['fechas' => $fechas]);
