<?php
require_once("../config/conexion.php");
header('Content-Type: application/json');

$idFuncion = $_GET['idFuncion'] ?? null;
if (!$idFuncion) {
    echo json_encode([]);
    exit;
}

$conn = conexion::conectar();

$stmt = $conn->prepare("SELECT idPlanoSala FROM BOLETA_ASIENTO WHERE idFuncion = ?");
$stmt->bind_param("i", $idFuncion);
$stmt->execute();
$res = $stmt->get_result();

$ocupados = [];
while ($row = $res->fetch_assoc()) {
    $ocupados[] = [
        'idPlanoSala' => $row['idPlanoSala']
    ];
}

echo json_encode($ocupados);
?>
