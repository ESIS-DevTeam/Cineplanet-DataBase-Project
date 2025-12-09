<?php
header('Content-Type: application/json');
require_once('../../config/conexion.php');
$conn = conexion::conectar();
$id = intval($_GET['id']);
$fecha = $_GET['fecha'];
$stmt = $conn->prepare("CALL public_get_funciones_por_cine_fecha(?, ?)");
$stmt->bind_param('is', $id, $fecha);
$stmt->execute();
$res = $stmt->get_result();
$funciones = [];
while ($row = $res->fetch_assoc()) {
    $row['pelicula'] = [
        'id' => $row['idPelicula'],
        'nombre' => $row['nombrePelicula'],
        'portada' => $row['portada'],
        'duracionStr' => $row['duracion'] ? (int)($row['duracion']/60) . 'h ' . ($row['duracion']%60) . 'min' : '',
        'generoNombre' => $row['generoNombre'],
        'restriccionNombre' => $row['restriccionNombre'],
        'restriccionComercial' => $row['restriccionComercial']
    ];
    $funciones[] = $row;
}
$stmt->close();
echo json_encode(['funciones' => $funciones]);
