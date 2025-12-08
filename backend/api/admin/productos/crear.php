<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();

try {
    // Usar $_POST y $_FILES para archivos
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : null;
    $descripcion = isset($_POST['descripcion']) ? trim($_POST['descripcion']) : null;
    $precio = isset($_POST['precio']) ? floatval($_POST['precio']) : null;
    $tipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : null;
    $estado = isset($_POST['estado']) ? trim($_POST['estado']) : null;
    $requiereSocio = isset($_POST['requiereSocio']) ? intval($_POST['requiereSocio']) : 0;
    $gradoMinimo = isset($_POST['gradoMinimo']) ? $_POST['gradoMinimo'] : null;
    $requiereEmpleado = isset($_POST['requiereEmpleado']) ? intval($_POST['requiereEmpleado']) : 0;
    $canjeaPuntos = isset($_POST['canjeaPuntos']) ? intval($_POST['canjeaPuntos']) : 0;
    $puntosNecesarios = isset($_POST['puntosNecesarios']) && $_POST['puntosNecesarios'] !== '' ? intval($_POST['puntosNecesarios']) : null;

    // Imagen
    $imagenNombre = '';
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $dirDestino = __DIR__ . '/../../../../frontend/images/portrait/candy/';
        if (!is_dir($dirDestino)) {
            mkdir($dirDestino, 0777, true);
        }
        $nombreArchivo = basename($_FILES['imagen']['name']);
        $rutaCompleta = $dirDestino . $nombreArchivo;
        if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
            $imagenNombre = $nombreArchivo;
        }
    }

    // Depuración
    // error_log("DEBUG PRODUCTO: nombre=$nombre, precio=$precio, tipo=$tipo, estado=$estado");

    if (!$nombre || !$precio || !$tipo || !$estado) {
        throw new Exception("Faltan campos requeridos");
    }

    $sql = "INSERT INTO PRODUCTO (nombre, descripcion, precio, imagen, tipo, estado, requiereSocio, gradoMinimo, requiereEmpleado, canjeaPuntos, puntosNecesarios)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssdsssisiii",
        $nombre,
        $descripcion,
        $precio,
        $imagenNombre,
        $tipo,
        $estado,
        $requiereSocio,
        $gradoMinimo,
        $requiereEmpleado,
        $canjeaPuntos,
        $puntosNecesarios
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Producto creado', 'id' => $conexion->insert_id]);
    } else {
        throw new Exception("Error al crear: " . $stmt->error);
    }
    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
