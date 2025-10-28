<?php
require_once "../data/restriccionData.php";

class RestriccionBusiness {
    public static function obtenerRestricciones() {
        return RestriccionData::listarTodas();
    }
}
?>
