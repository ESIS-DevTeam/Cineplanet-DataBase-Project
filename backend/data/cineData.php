<?php
require_once "../config/conexion.php";

class CineData {

    public static function listarTodas() {
        $conn = Conexion::conectar();
        $sql = "CALL cine_get_all_with_ciudad()";
        $result = $conn->query($sql);

        $cines = [];

        if ($result) {
            while ($fila = $result->fetch_assoc()) {
                $cines[] = $fila;
            }
        }

        return $cines;
    }
}
?>
