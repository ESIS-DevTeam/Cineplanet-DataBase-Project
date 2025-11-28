<?php
header('Content-Type: application/json');
include '../../../config/conexion.php';

$conexion = conexion::conectar();
$sql = "SELECT s.*, u.nombre, u.email, u.numeroDocumento
        FROM SOCIO s
        JOIN USUARIO u ON s.id = u.id
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
