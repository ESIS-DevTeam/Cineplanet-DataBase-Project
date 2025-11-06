<?php
require_once("../config/conexion.php");
$conn = conexion::conectar();

$idSala = isset($_GET['idSala']) ? intval($_GET['idSala']) : 0;
$asientos = [];

if ($idSala > 0) {
    $stmt = $conn->prepare("SELECT id, idSala, fila, numero, tipo FROM PLANO_SALA WHERE idSala = ? ORDER BY fila, numero");
    $stmt->bind_param("i", $idSala);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $asientos[] = $row;
    }
    $stmt->close();
}

header('Content-Type: application/json');
echo json_encode($asientos);
?>
