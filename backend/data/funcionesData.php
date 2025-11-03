<?php
require_once "../config/conexion.php";

class FuncionesData
{
    public static function obtenerFunciones()
    {
        $sql = "CALL funcion_get_all()";
        $conn = conexion::conectar();
        $result = $conn->query($sql);

        if ($result === false) {
            http_response_code(500);
            echo json_encode(["error" => "Error en la consulta SQL: " . $conn->error]);
            exit;
        }

        $data = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        
        return $data;
    }
}
?>
