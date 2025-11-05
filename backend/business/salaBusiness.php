<?php
require_once "../data/salaData.php";

class SalaBusiness {
    public static function obtenerSalasPorCine($idCine) {
        return SalaData::getSalasByCine($idCine);
    }

    // Aquí puedes agregar otros métodos de lógica de negocio para Sala si los necesitas
    // Por ejemplo: crearSala, actualizarSala, etc.
}
?>
