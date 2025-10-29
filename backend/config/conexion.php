<?php
class conexion {
    private static $conexion = null;

    public static function conectar() {
        if (self::$conexion === null) {
            // Datos del profesor
            $host = "srv812.hstgr.io";
            $user = "u914095763_g11";
            $pass = "bdZs962p";
            $db   = "u914095763_g11";
            $port = 3306;

            self::$conexion = new mysqli($host, $user, $pass, $db, $port);

            if (self::$conexion->connect_error) {
                die("Error de conexión: " . self::$conexion->connect_error);
            }
        }
        return self::$conexion;
    }
}
?>
