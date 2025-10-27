<?php
require_once "../config/conexion.php";

class CiudadData {

    public static function listarTodas() {
        $conn = Conexion::conectar();
        $sql = "CALL ciudad_get_all()";
        $result = $conn->query($sql);

        $ciudades = [];

        if ($result) {
            while ($fila = $result->fetch_assoc()) {
                $ciudades[] = $fila;
            }
        }

        return $ciudades;
    }
}
?>
