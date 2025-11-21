<?php
require_once('../../config/conexion.php');
header('Content-Type: application/json');
$conn = conexion::conectar();
$id = intval($_GET['id']);
$hoy = date('Y-m-d');
$sql = "SELECT DISTINCT p.id, p.nombre, p.portada, p.duracion,
        g.nombre as generoNombre, r.nombre as restriccionNombre
    FROM FUNCION f
    JOIN SALA s ON f.idSala = s.id
    JOIN PELICULA p ON f.idPelicula = p.id
    JOIN GENERO g ON p.genero = g.id
    JOIN RESTRICCION r ON p.restriccion = r.id
    WHERE s.idCine = $id AND f.estado = 'activa' AND f.fecha >= '$hoy' AND p.estado = 'activa'
    ORDER BY p.nombre";
$res = $conn->query($sql);
$peliculas = [];
while ($row = $res->fetch_assoc()) {
    $row['duracionStr'] = $row['duracion'] ? (int)($row['duracion']/60) . 'h ' . ($row['duracion']%60) . 'min' : '';
    $peliculas[] = $row;
}
echo json_encode(['peliculas' => $peliculas]);
