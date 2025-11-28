<?php
header('Content-Type: application/json');
include '../../../config/conexion.php';

$id = $_GET['id'] ?? null;
$datos = json_decode(file_get_contents("php://input"), true);
$conexion = conexion::conectar();

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID de socio no proporcionado']);
    exit;
}

// Preparar variables por referencia
$empleado = intval($datos['empleado'] ?? 0);
$grado = $datos['grado'] ?? 'clasico';
$puntos = intval($datos['puntos'] ?? 0);
$apellidoPaterno = $datos['apellidoPaterno'] ?? null;
$apellidoMaterno = $datos['apellidoMaterno'] ?? null;
$departamento = $datos['departamento'] ?? null;
$provincia = $datos['provincia'] ?? null;
$distrito = $datos['distrito'] ?? null;
$celular = $datos['celular'] ?? null;
$genero = $datos['genero'] ?? null;
$fechaNacimiento = $datos['fechaNacimiento'] ?? null;
$cineplanetFavorito = $datos['cineplanetFavorito'] ?? null;

if (!empty($datos['password'])) {
    $passwordHash = password_hash($datos['password'], PASSWORD_DEFAULT);

    $sql = "UPDATE SOCIO SET 
            password=?,
            apellidoPaterno=?, 
            apellidoMaterno=?, 
            grado=?, 
            departamento=?, 
            provincia=?, 
            distrito=?, 
            celular=?, 
            genero=?, 
            fechaNacimiento=?, 
            cineplanetFavorito=?, 
            empleado=?, 
            puntos=? 
            WHERE id=?";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Error en prepare: ' . $conexion->error]);
        exit;
    }

    $stmt->bind_param(
        'sssssssssssiii',
        $passwordHash,
        $apellidoPaterno,
        $apellidoMaterno,
        $grado,
        $departamento,
        $provincia,
        $distrito,
        $celular,
        $genero,
        $fechaNacimiento,
        $cineplanetFavorito,
        $empleado,
        $puntos,
        $id
    );
} else {
    $sql = "UPDATE SOCIO SET 
            apellidoPaterno=?, 
            apellidoMaterno=?, 
            grado=?, 
            departamento=?, 
            provincia=?, 
            distrito=?, 
            celular=?, 
            genero=?, 
            fechaNacimiento=?, 
            cineplanetFavorito=?, 
            empleado=?, 
            puntos=? 
            WHERE id=?";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Error en prepare: ' . $conexion->error]);
        exit;
    }

    $stmt->bind_param(
        'ssssssssssiii',
        $apellidoPaterno,
        $apellidoMaterno,
        $grado,
        $departamento,
        $provincia,
        $distrito,
        $celular,
        $genero,
        $fechaNacimiento,
        $cineplanetFavorito,
        $empleado,
        $puntos,
        $id
    );
}

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Socio actualizado']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $stmt->error]);
}
$stmt->close();
?>
