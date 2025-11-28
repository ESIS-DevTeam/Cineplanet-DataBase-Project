<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();

try {
    $sql = "SELECT 
                f.id, f.idPelicula, f.idSala, f.idFormato, f.idIdioma,
                f.fecha, f.hora, f.precio, f.estado,
                p.nombre as nombrePelicula,
                s.nombre as nombreSala,
                s.idCine,
                c.idCiudad,
                ci.nombre as nombreCiudad,
                fo.nombre as nombreFormato,
                i.nombre as nombreIdioma
            FROM FUNCION f
            LEFT JOIN PELICULA p ON f.idPelicula = p.id
            LEFT JOIN SALA s ON f.idSala = s.id
            LEFT JOIN CINE c ON s.idCine = c.id
            LEFT JOIN CIUDAD ci ON c.idCiudad = ci.id
            LEFT JOIN FORMATO fo ON f.idFormato = fo.id
            LEFT JOIN IDIOMA i ON f.idIdioma = i.id
            ORDER BY f.fecha ASC, f.hora ASC";
    
    $result = $conexion->query($sql);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . $conexion->error);
    }
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $data]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
