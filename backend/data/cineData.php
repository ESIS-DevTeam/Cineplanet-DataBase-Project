<?php
require_once "../config/conexion.php";

class CineData {

    public static function listarTodas() {
        $conn = Conexion::conectar();
        $sql = "SELECT * FROM CINE";
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
