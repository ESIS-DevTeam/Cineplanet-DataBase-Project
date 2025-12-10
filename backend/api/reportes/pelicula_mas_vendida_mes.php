<?php
include_once '../../config/conexion.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

$conexion = conexion::conectar();
$response = ["success" => false, "message" => "", "data" => []];

try {
    $sql = "SELECT 
                p.nombre AS pelicula, 
                COUNT(ba.id) AS entradas_vendidas, 
                SUM(ba.precioUnitario) AS total_ingresos
            FROM BOLETA b
            JOIN BOLETA_ASIENTO ba ON b.id = ba.idBoleta
            JOIN FUNCION f ON ba.idFuncion = f.id
            JOIN PELICULA p ON f.idPelicula = p.id
            WHERE MONTH(b.fecha) = MONTH(CURRENT_DATE()) 
              AND YEAR(b.fecha) = YEAR(CURRENT_DATE())
            GROUP BY p.id
            ORDER BY entradas_vendidas DESC";

    $result = $conexion->query($sql);

    if ($result) {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $response["success"] = true;
        $response["data"] = $data;
    } else {
        $response["message"] = "Error en la consulta: " . $conexion->error;
    }
} catch (Exception $e) {
    $response["message"] = "Error: " . $e->getMessage();
}

echo json_encode($response);
?>
