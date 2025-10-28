<?php
require_once "../config/conexion.php";

class FormatoData {

    public static function listarTodas() {
        $conn = Conexion::conectar();
        $sql = "SELECT * FROM FORMATO";
        $result = $conn->query($sql);

        $formatos = [];

        if ($result) {
            while ($fila = $result->fetch_assoc()) {
                $formatos[] = $fila;
            }
        }

        return $formatos;
    }
}
?>
