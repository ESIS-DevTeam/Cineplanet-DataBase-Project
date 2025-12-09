<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../config/conexion.php';

$conexion = conexion::conectar();

try {
    $sql = "
        SELECT 
            pr.nombre AS promocion,
            COUNT(pb.id) AS veces_usada,
            SUM(pb.montoDescuento) AS total_descuento
        FROM PROMO_BOLETA pb
        JOIN PROMO pr ON pb.idPromo = pr.id
        JOIN BOLETA b ON pb.idBoleta = b.id
        WHERE MONTH(b.fecha) = MONTH(CURDATE()) AND YEAR(b.fecha) = YEAR(CURDATE())
        GROUP BY pr.id
        ORDER BY veces_usada DESC
        LIMIT 10
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
