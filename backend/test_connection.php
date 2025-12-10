<?php
// Incluir el archivo de configuración de la conexión
require_once 'config/conexion.php';

echo "<h2>Prueba de Conexión a Base de Datos</h2>";

try {
    // Intentar obtener la instancia de la conexión
    $db = conexion::conectar();

    if ($db) {
        echo "<p style='color: green; font-weight: bold;'>✅ ¡Conexión exitosa!</p>";
        echo "<p>Se ha conectado correctamente a la base de datos definida en <code>config/conexion.php</code>.</p>";
        echo "<ul>";
        echo "<li><strong>Host:</strong> " . $db->host_info . "</li>";
        echo "<li><strong>Versión del Servidor:</strong> " . $db->server_info . "</li>";
        echo "</ul>";
    } else {
        echo "<p style='color: red;'>❌ La conexión devolvió null.</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error detectado: " . $e->getMessage() . "</p>";
}
?>
