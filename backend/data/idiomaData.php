<?php
require_once "../config/conexion.php";

class IdiomaData {

    public static function listarTodas() {
        $conn = Conexion::conectar();
        $sql = "CALL idioma_get_all()";
        $result = $conn->query($sql);

        $idiomas = [];

        if ($result) {
            while ($fila = $result->fetch_assoc()) {
                $idiomas[] = $fila;
            }
        }

        return $idiomas;
    }
}
?>
