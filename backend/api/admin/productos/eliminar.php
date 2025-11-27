<?php
header('Content-Type: application/json');
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$id = $_GET['id'] ?? null;

try {
    if (!$id) throw new Exception("ID no proporcionado");

    // Obtener nombre de imagen antes de eliminar
    $imagenActual = '';
    $stmtSelect = $conexion->prepare("SELECT imagen FROM PRODUCTO WHERE id=?");
    $stmtSelect->bind_param('i', $id);
    $stmtSelect->execute();
    $stmtSelect->bind_result($imagenActual);
    $stmtSelect->fetch();
    $stmtSelect->close();

    // Eliminar el producto
    $sql = "DELETE FROM PRODUCTO WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            // Eliminar imagen del disco si existe
            if ($imagenActual) {
                $rutaImagen = __DIR__ . '/../../../../frontend/images/portrait/candy/' . $imagenActual;
                if (file_exists($rutaImagen)) {
                    unlink($rutaImagen);
                }
            }
            echo json_encode(['success' => true, 'message' => 'Producto eliminado']);
        } else {
            throw new Exception("Producto no encontrado");
        }
    } else {
        throw new Exception("Error al eliminar: " . $stmt->error);
    }
    $stmt->close();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
