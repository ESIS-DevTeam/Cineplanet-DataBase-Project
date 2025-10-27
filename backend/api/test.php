<?php
header("Content-Type: application/json");
require_once(__DIR__ . '/../config/conexion.php');

$conn = Conexion::conectar();

if ($conn) {
    echo json_encode(["mensaje" => "✅ Conexión exitosa a la base de datos."]);
} else {
    echo json_encode(["error" => "❌ Error de conexión."]);
}
?>
