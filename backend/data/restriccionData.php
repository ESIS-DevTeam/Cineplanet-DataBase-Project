<?php
require_once "../config/conexion.php";

class RestriccionData {

    public static function listarTodas() {
        $conn = Conexion::conectar();
        $sql = "SELECT * FROM RESTRICCION";
        $result = $conn->query($sql);

        $restricciones = [];

        if ($result) {
            while ($fila = $result->fetch_assoc()) {
                $restricciones[] = $fila;
            }
        }

        return $restricciones;
    }
}
?>
