<?php
require_once "../config/conexion.php";

class PeliculaData {

    public static function listarActivas() {
        $conn = Conexion::conectar();
        $sql = "CALL pelicula_get_active()";
        $result = $conn->query($sql);

        $peliculas = [];

        if ($result) {
            while ($fila = $result->fetch_assoc()) {
                $peliculas[] = $fila;
            }
        }

        return $peliculas;
    }

    public static function listarConFuncionActiva() {
        $conn = Conexion::conectar();
        $sql = "SELECT DISTINCT idPelicula, nombrePelicula FROM peliculas_funciones_activas";
        $result = $conn->query($sql);

        $peliculas = [];

        if ($result) {
            while ($fila = $result->fetch_assoc()) {
                $peliculas[] = [
                    'id' => $fila['idPelicula'],
                    'nombre' => $fila['nombrePelicula']
                ];
            }
        }

        return $peliculas;
    }

    public static function obtenerPorId($id) {
        $conn = Conexion::conectar();
        $stmt = $conn->prepare("CALL pelicula_get(?)");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        $pelicula = $result ? $result->fetch_assoc() : null;

        $stmt->close();
        $conn->next_result(); // Limpiar resultados previos de procedimientos

        return $pelicula;
    }
}
?>
