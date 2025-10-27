<?php
require_once "../config/conexion.php";

class PeliculaData {

    public static function listarActivas() {
        $conn = Conexion::conectar();
        $sql = "CALL pelicula_get_active()";
        $result = $conn->query($sql);

        $peliculas = [];

        if ($result) {
            while ($fila = $result->fetch_assoc()) {
                $peliculas[] = $fila;
            }
        }

        return $peliculas;
    }
}
?>
