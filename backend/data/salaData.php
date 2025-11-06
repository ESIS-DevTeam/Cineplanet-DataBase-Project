<?php
require_once __DIR__ . '/../config/conexion.php';

class SalaData {
    public static function getSalasByCine($idCine) {
        $db = conexion::conectar();
        $stmt = $db->prepare("CALL sala_get_by_cine(?)");
        $stmt->bind_param("i", $idCine);
        $stmt->execute();
        $result = $stmt->get_result();
        $salas = [];
        while ($row = $result->fetch_assoc()) {
            $salas[] = $row;
        }
        $stmt->close();
        // No cerrar $db porque es conexión estática
        return $salas;
    }

    // Aquí puedes agregar otros métodos de acceso a datos para Sala
}
?>
