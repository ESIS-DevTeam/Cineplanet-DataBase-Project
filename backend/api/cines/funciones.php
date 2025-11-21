<?php
header('Content-Type: application/json');
require_once('../../config/conexion.php');
$conn = conexion::conectar();
$id = intval($_GET['id']);
$fecha = $_GET['fecha'];
$sql = "SELECT f.id, f.hora, f.precio, f.estado,
        p.id as idPelicula, p.nombre as nombrePelicula, p.portada, p.duracion,
        g.nombre as generoNombre, r.nombre as restriccionNombre, p.restriccionComercial,
        f.idFormato, fo.nombre as formatoNombre, f.idIdioma, i.nombre as idiomaNombre
    FROM FUNCION f
    JOIN SALA s ON f.idSala = s.id
    JOIN PELICULA p ON f.idPelicula = p.id
    JOIN GENERO g ON p.genero = g.id
    JOIN RESTRICCION r ON p.restriccion = r.id
    JOIN FORMATO fo ON f.idFormato = fo.id
    LEFT JOIN IDIOMA i ON f.idIdioma = i.id
    WHERE s.idCine = $id AND f.estado = 'activa' AND f.fecha = '$fecha'
    ORDER BY p.nombre, f.hora";
$res = $conn->query($sql);
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
echo json_encode(['funciones' => $funciones]);
