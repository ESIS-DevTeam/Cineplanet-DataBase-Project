<?php
class conexion {
    private static $conexion = null;

    public static function conectar() {
        if (self::$conexion === null) {
            self::$conexion = new mysqli("localhost", "root", "", "dbcineplanet");
            if (self::$conexion->connect_error) {
                die("Error de conexión: " . self::$conexion->connect_error);
            }
        }
        return self::$conexion;
    }
}
?>