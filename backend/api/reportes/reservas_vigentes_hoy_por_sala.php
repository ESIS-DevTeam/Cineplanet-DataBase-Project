<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../config/conexion.php';

$conexion = conexion::conectar();

try {
    $sql = "
        SELECT 
            s.nombre AS sala,
            COUNT(DISTINCT ba.idBoleta) AS reservas,
            SUM(ba.precioUnitario) AS ingresos
        FROM BOLETA_ASIENTO ba
        JOIN FUNCION f ON ba.idFuncion = f.id
        JOIN SALA s ON f.idSala = s.id
        WHERE f.fecha = CURDATE()
        GROUP BY s.id
        ORDER BY reservas DESC
    ";
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $data]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
