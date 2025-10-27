<?php
require_once "../data/peliculaData.php";

class PeliculaBusiness {
    public static function obtenerPeliculasActivas() {
        return PeliculaData::listarActivas();
    }
}
?>
