<?php
require_once "../data/funcionesData.php";

class FuncionesBusiness
{
    public static function obtenerFunciones()
    {
        return FuncionesData::obtenerFunciones();
    }
}
?>
