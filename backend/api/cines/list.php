<?php
require_once('../../config/conexion.php');
header('Content-Type: application/json');
$conn = conexion::conectar();

$ciudad = isset($_GET['ciudad']) ? intval($_GET['ciudad']) : null;
$formato = isset($_GET['formato']) ? intval($_GET['formato']) : null;
$hoy = date('Y-m-d');

$where = [];
if ($ciudad) $where[] = "c.idCiudad = $ciudad";

$sql = "SELECT c.id, c.nombre, c.direccion, c.imagen
        FROM CINE c";
if ($where) $sql .= " WHERE " . implode(' AND ', $where);

$res = $conn->query($sql);
$cines = [];
while ($row = $res->fetch_assoc()) {
    // Obtener formatos de funciones activas y vigentes para este cine
    $formatos = [];
    $sqlF = "SELECT DISTINCT f.id, f.nombre
             FROM SALA s
             JOIN FUNCION fu ON fu.idSala = s.id
             JOIN FORMATO f ON fu.idFormato = f.id
             WHERE s.idCine = " . intval($row['id']) . "
               AND fu.estado = 'activa'
               AND fu.fecha >= '$hoy'";
    if ($formato) $sqlF .= " AND f.id = $formato";
    $resF = $conn->query($sqlF);
    while ($rowF = $resF->fetch_assoc()) {
        $formatos[] = $rowF['nombre'];
    }
    // Si se filtra por formato y no hay funciones, no mostrar el cine
    if ($formato && count($formatos) == 0) continue;
    // Si no hay funciones activas y vigentes, no mostrar el cine
    if (count($formatos) == 0) continue;
    $row['formatos'] = $formatos;
    $cines[] = $row;
}
echo json_encode(['cines' => $cines]);
