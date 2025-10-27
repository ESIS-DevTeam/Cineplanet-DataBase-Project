<?php
require_once "../data/ciudadData.php";

class CiudadBusiness {
    public static function obtenerCiudades() {
        return CiudadData::listarTodas();
    }
}
?>
