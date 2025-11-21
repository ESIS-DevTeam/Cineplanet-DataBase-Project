<?php
require_once("../config/conexion.php");
$conn = conexion::conectar();

$idCine = isset($_GET['idCine']) ? intval($_GET['idCine']) : 0;
$res = $conn->query("SELECT nombre, direccion, imagen FROM CINE WHERE id = $idCine LIMIT 1");
if ($row = $res->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode([]);
}
?>
