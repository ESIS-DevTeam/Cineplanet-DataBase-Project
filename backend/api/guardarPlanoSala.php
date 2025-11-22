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

// Inserción masiva
$values = [];
foreach ($data as $asiento) {
    $fila = $conn->real_escape_string($asiento['fila']);
    $numero = intval($asiento['numero']);
    $tipo = $conn->real_escape_string($asiento['tipo']);
    $values[] = "($idSala, '$fila', $numero, '$tipo')";
}
$sql = "INSERT INTO PLANO_SALA (idSala, fila, numero, tipo) VALUES " . implode(',', $values);
$result = $conn->query($sql);

if ($result) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
}
?>
