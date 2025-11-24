<?php
require_once("../config/conexion.php");

header('Content-Type: application/json');

if (!isset($_GET['idSocio'])) {
    echo json_encode(['error' => 'Falta idSocio']);
    exit;
}

$idSocio = intval($_GET['idSocio']);
$conn = conexion::conectar();

$stmt = $conn->prepare("SELECT puntos FROM SOCIO WHERE id = ?");
$stmt->bind_param("i", $idSocio);
$stmt->execute();
$stmt->bind_result($puntos);

if ($stmt->fetch()) {
    echo json_encode(['puntos' => intval($puntos)]);
} else {
    echo json_encode(['puntos' => 0]);
}

$stmt->close();
