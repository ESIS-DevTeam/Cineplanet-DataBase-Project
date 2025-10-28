<?php
require_once "../data/formatoData.php";

class FormatoBusiness {
    public static function obtenerFormatos() {
        return FormatoData::listarTodas();
    }
}
?>
