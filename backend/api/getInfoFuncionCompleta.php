<?php
require_once "../config/conexion.php";
$conn = conexion::conectar();

$idFuncion = isset($_GET['idFuncion']) ? intval($_GET['idFuncion']) : 0;
$info = [];

if ($idFuncion > 0) {
    $stmt = $conn->prepare("CALL funcion_info_completa(?)");
    $stmt->bind_param("i", $idFuncion);
    $stmt->execute();
    $result = $stmt->get_result();
    $info = $result->fetch_assoc();
    $stmt->close();
}

header("Content-Type: application/json");
echo json_encode($info ? $info : []);
?>
