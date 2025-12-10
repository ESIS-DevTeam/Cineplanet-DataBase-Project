<?php
header("Content-Type: application/json");
require_once "../config/conexion.php";

try {
    $conn = conexion::conectar();
    
    // Obtener películas activas que tengan frame configurado
    $query = "SELECT id, nombre, sinopsis, trailer, portada, frame, duracion 
              FROM PELICULA 
              WHERE estado = 'activa' 
              AND frame IS NOT NULL 
              AND frame != ''
              ORDER BY id DESC
              LIMIT 5";
    
    $result = $conn->query($query);
    
    $peliculas = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Si el frame no tiene la ruta completa, agregarla
            if (!empty($row['frame']) && strpos($row['frame'], 'frontend/') !== 0) {
                $row['frame'] = 'frontend/images/frames/' . $row['frame'];
            }
            
            // Lo mismo para portada si es necesario
            if (!empty($row['portada']) && strpos($row['portada'], 'frontend/') !== 0) {
                $row['portada'] = 'frontend/images/portrait/movie/' . $row['portada'];
            }
            
            $peliculas[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $peliculas
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener películas destacadas: ' . $e->getMessage()
    ]);
}
?>
