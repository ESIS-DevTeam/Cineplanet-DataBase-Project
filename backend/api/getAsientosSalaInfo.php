<?php
require_once "../config/conexion.php";
header('Content-Type: application/json');

$ids = isset($_GET['ids']) ? $_GET['ids'] : '';
if (!$ids) {
    echo json_encode(['salaNombre' => '', 'asientos' => []]);
    exit;
}

$conn = conexion::conectar();
$idArr = array_filter(array_map('intval', explode(',', $ids)));

$asientos = [];
$salaNombre = '';

if (count($idArr) > 0) {
    $placeholders = implode(',', array_fill(0, count($idArr), '?'));
    $types = str_repeat('i', count($idArr));
    $sql = "SELECT PLANO_SALA.id, PLANO_SALA.fila, PLANO_SALA.numero, SALA.nombre AS salaNombre
            FROM PLANO_SALA
            JOIN SALA ON PLANO_SALA.idSala = SALA.id
            WHERE PLANO_SALA.id IN ($placeholders)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$idArr);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $asientos[] = [
            'id' => $row['id'],
            'fila' => $row['fila'],
            'numero' => $row['numero']
        ];
        $salaNombre = $row['salaNombre'];
    }
    $stmt->close();
}

echo json_encode(['salaNombre' => $salaNombre, 'asientos' => $asientos]);
?>
