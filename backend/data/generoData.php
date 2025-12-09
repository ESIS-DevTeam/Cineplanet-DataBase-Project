<?php
require_once "../config/conexion.php";

class GeneroData {

    public static function listarTodas() {
        $conn = Conexion::conectar();
        $sql = "CALL genero_get_all()";
        $result = $conn->query($sql);

        $generos = [];

        if ($result) {
            while ($fila = $result->fetch_assoc()) {
                $generos[] = $fila;
            }
        }

        return $generos;
    }
}
?>
