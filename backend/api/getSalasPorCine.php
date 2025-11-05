<?php
require_once "../business/salaBusiness.php";

$idCine = isset($_GET['idCine']) ? (int)$_GET['idCine'] : 0;

if ($idCine > 0) {
    $salas = SalaBusiness::obtenerSalasPorCine($idCine);
    header("Content-Type: application/json");
    echo json_encode($salas);
} else {
    http_response_code(400);
    echo json_encode(["error" => "idCine es requerido"]);
}
?>
