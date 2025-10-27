<?php
require_once "../data/cineData.php";

class CineBusiness {
    public static function obtenerCines() {
        return CineData::listarTodas();
    }
}
?>
