<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;

try {
    if (!$id) throw new Exception("ID no proporcionado");

    // Usar $_POST y $_FILES para archivos
    $nombre = $_POST['nombre'] ?? null;
    $descripcion = $_POST['descripcion'] ?? null;
    $precio = $_POST['precio'] ?? null;
    $tipo = $_POST['tipo'] ?? null;
    $estado = $_POST['estado'] ?? null;
    $requiereSocio = $_POST['requiereSocio'] ?? 0;
    $gradoMinimo = $_POST['gradoMinimo'] ?? null;
    $requiereEmpleado = $_POST['requiereEmpleado'] ?? 0;
    $canjeaPuntos = $_POST['canjeaPuntos'] ?? 0;
    $puntosNecesarios = $_POST['puntosNecesarios'] ?? null;

    // Obtener nombre de imagen actual antes de actualizar
    $imagenActual = '';
    $stmtSelect = $conexion->prepare("SELECT imagen FROM PRODUCTO WHERE id=?");
    $stmtSelect->bind_param('i', $id);
    $stmtSelect->execute();
    $stmtSelect->bind_result($imagenActual);
    $stmtSelect->fetch();
    $stmtSelect->close();

    // Imagen
    $imagenNombre = $imagenActual;
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $dirDestino = __DIR__ . '/../../../../frontend/images/portrait/candy/';
        if (!is_dir($dirDestino)) {
            mkdir($dirDestino, 0777, true);
        }
        $nombreArchivo = basename($_FILES['imagen']['name']);
        $rutaCompleta = $dirDestino . $nombreArchivo;
        if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
            $imagenNombre = $nombreArchivo;
            // Eliminar imagen anterior si existe y es distinta de la nueva
            if ($imagenActual && $imagenActual !== $imagenNombre) {
                $rutaAnterior = $dirDestino . $imagenActual;
                if (file_exists($rutaAnterior)) {
                    unlink($rutaAnterior);
                }
            }
        }
    }

    if (!$nombre || !$precio || !$tipo || !$estado) {
        throw new Exception("Faltan campos requeridos");
    }

    $sql = "UPDATE PRODUCTO SET nombre = ?, descripcion = ?, precio = ?, imagen = ?, tipo = ?, estado = ?, requiereSocio = ?, gradoMinimo = ?, requiereEmpleado = ?, canjeaPuntos = ?, puntosNecesarios = ? WHERE id = ?";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param(
        "ssdsssisiiii",
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
        $puntosNecesarios,
        $id
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Producto actualizado']);
    } else {
        throw new Exception("Error al actualizar: " . $stmt->error);
    }
    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
