<?php
header('Content-Type: application/json');
require_once('../../config/conexion.php');
$conn = conexion::conectar();
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

$stmt = $conn->prepare("CALL cine_get_by_id(?)");
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
$cine = $result->fetch_assoc();
$stmt->close();

echo json_encode(['cine' => $cine]);
