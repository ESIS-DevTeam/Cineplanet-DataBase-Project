<?php
header('Content-Type: application/json');
require_once('../../config/conexion.php');
$conn = conexion::conectar();
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$res = $conn->query("SELECT c.id, c.nombre, c.direccion, c.imagen FROM CINE c WHERE c.id = $id");
$cine = $res->fetch_assoc();
echo json_encode(['cine' => $cine]);
