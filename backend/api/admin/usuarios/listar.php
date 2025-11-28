<?php
header('Content-Type: application/json');
include '../../../config/conexion.php';

$conexion = conexion::conectar();
$sql = "SELECT u.*, 
        CASE 
            WHEN s.id IS NOT NULL THEN 'Socio'
            ELSE 'Cliente Regular'
        END as estado_cliente
        FROM USUARIO u
        LEFT JOIN SOCIO s ON u.id = s.id
        ORDER BY u.nombre ASC";
$resultado = $conexion->query($sql);

if ($resultado) {
    $datos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $datos[] = $fila;
    }
    echo json_encode(['success' => true, 'data' => $datos]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error en la consulta']);
}
?>
