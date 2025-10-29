<?php
class conexion {
    private static $conexion = null;

    public static function conectar() {
        if (self::$conexion === null) {
            // Datos del servidor remoto (Hostinger)
            $host = "srv812.hstgr.io";        // Hostname
            $user = "u914095763_g11";         // Username
            $pass = "bdZs962p";               // Password
            $db   = "u914095763_g11";         // Nombre de la base de datos
            $port = 3306;                     // Puerto MySQL

            self::$conexion = new mysqli($host, $user, $pass, $db, $port);

            if (self::$conexion->connect_error) {
                die("❌ Error de conexión: " . self::$conexion->connect_error);
            } else {
                // echo "✅ Conexión exitosa"; // (opcional para probar)
            }
        }
        return self::$conexion;
    }
}
?>
