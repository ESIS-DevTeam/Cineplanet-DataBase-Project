<?php
require_once("../config/conexion.php");
$conn = conexion::conectar();

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data) || count($data) == 0) {
    http_response_code(400);
    echo json_encode(["error" => "Datos de plano inválidos"]);
    exit;
}

$idSala = intval($data[0]['idSala']);

// Eliminar plano anterior
$stmtDel = $conn->prepare("DELETE FROM PLANO_SALA WHERE idSala = ?");
$stmtDel->bind_param("i", $idSala);
$stmtDel->execute();
$stmtDel->close();

// Insertar nuevo plano
$stmtIns = $conn->prepare("CALL plano_sala_create(?, ?, ?, ?, @new_id)");
foreach ($data as $asiento) {
    $fila = $asiento['fila'];
    $numero = intval($asiento['numero']);
    $tipo = $asiento['tipo'];
    $stmtIns->bind_param("isis", $idSala, $fila, $numero, $tipo);
    $stmtIns->execute();
}
$stmtIns->close();

echo json_encode(["success" => true]);
?>
