<?php
require_once '../config/conexion.php';
$conn = conexion::conectar();
$res = $conn->query("SELECT * FROM PRODUCTO WHERE estado='activo'");
$productos = [];
while ($row = $res->fetch_assoc()) {
    $productos[] = $row;
}
header('Content-Type: application/json');
echo json_encode($productos);
?>
