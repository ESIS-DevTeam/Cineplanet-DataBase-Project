<?php
require_once "../data/idiomaData.php";

class IdiomaBusiness {
    public static function obtenerIdiomas() {
        return IdiomaData::listarTodas();
    }
}
?>
