<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../config/conexion.php';

$conexion = conexion::conectar();

try {
    $sql = "
        SELECT 
            p.nombre AS producto,
            SUM(pb.cantidad) AS cantidad_vendida,
            SUM(pb.subtotal) AS total_ingresos
        FROM PRODUCTOS_BOLETA pb
        JOIN PRODUCTO p ON pb.idProducto = p.id
        JOIN BOLETA b ON pb.idBoleta = b.id
        WHERE MONTH(b.fecha) = MONTH(CURDATE()) AND YEAR(b.fecha) = YEAR(CURDATE())
        GROUP BY p.id
        ORDER BY cantidad_vendida DESC
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
