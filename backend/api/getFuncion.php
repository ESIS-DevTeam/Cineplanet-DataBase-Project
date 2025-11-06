<?php
require_once("../config/conexion.php");
$conn = conexion::conectar();

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$funcion = null;

if ($id > 0) {
    $stmt = $conn->prepare("CALL funcion_get(?)");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $funcion = $result->fetch_assoc();
    $stmt->close();
}

header('Content-Type: application/json');
echo json_encode($funcion ? $funcion : []);
?>
