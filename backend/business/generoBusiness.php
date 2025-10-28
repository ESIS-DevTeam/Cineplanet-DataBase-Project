<?php
require_once "../data/generoData.php";

class GeneroBusiness {
    public static function obtenerGeneros() {
        return GeneroData::listarTodas();
    }
}
?>
