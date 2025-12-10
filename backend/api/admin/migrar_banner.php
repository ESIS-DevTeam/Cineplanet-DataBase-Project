<?php
// Script para agregar el campo banner a la tabla PELICULA
// EJECUTAR SOLO UNA VEZ

require_once "../config/conexion.php";

try {
    $conn = conexion::conectar();
    
    // Verificar si la columna ya existe
    $checkQuery = "SHOW COLUMNS FROM PELICULA LIKE 'frame'";
    $result = $conn->query($checkQuery);
    
    if ($result->num_rows > 0) {
        echo "✅ La columna 'frame' ya existe en la tabla PELICULA<br>";
    } else {
        // Agregar la columna frame
        $alterQuery = "ALTER TABLE PELICULA ADD COLUMN frame VARCHAR(255) AFTER portada";
        
        if ($conn->query($alterQuery)) {
            echo "✅ Columna 'frame' agregada exitosamente a la tabla PELICULA<br>";
            
            // Opcional: Actualizar algunas películas de ejemplo
            $updates = [
                "UPDATE PELICULA SET frame = 'frontend/images/frames/4KOY11L2.jpg' 
                 WHERE nombre LIKE '%joker%' OR nombre LIKE '%Joker%'",
                
                "UPDATE PELICULA SET frame = 'frontend/images/frames/BPB5UKZ0.jpg' 
                 WHERE nombre LIKE '%Last of Us%' OR nombre LIKE '%last of us%'",
                
                "UPDATE PELICULA SET frame = 'frontend/images/frames/Barbie_23.jpg' 
                 WHERE nombre LIKE '%Barbie%' OR nombre LIKE '%barbie%'"
            ];
            
            foreach ($updates as $update) {
                $conn->query($update);
            }
            
            echo "✅ Películas de ejemplo actualizadas con frames<br>";
        } else {
            echo "❌ Error al agregar la columna: " . $conn->error . "<br>";
        }
    }
    
    echo "<br>✅ Script ejecutado correctamente<br>";
    echo "<p style='color: red; font-weight: bold;'>IMPORTANTE: Elimina o renombra este archivo después de usarlo por seguridad</p>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
