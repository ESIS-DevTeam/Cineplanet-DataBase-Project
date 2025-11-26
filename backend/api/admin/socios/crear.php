<?php
header('Content-Type: application/json');
include '../../../config/conexion.php';

$datos = json_decode(file_get_contents("php://input"), true);
$conexion = conexion::conectar();

// Validar que el usuario existe
$sqlCheck = "SELECT id FROM USUARIO WHERE id = ?";
$stmtCheck = $conexion->prepare($sqlCheck);
$stmtCheck->bind_param('i', $datos['idUsuario']);
$stmtCheck->execute();
if ($stmtCheck->get_result()->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    $stmtCheck->close();
    exit;
}
$stmtCheck->close();

$passwordHash = password_hash($datos['password'], PASSWORD_DEFAULT);
$empleado = intval($datos['empleado'] ?? 0);
$grado = $datos['grado'] ?? 'clasico';
$puntos = 0;

$sql = "INSERT INTO SOCIO (id, password, apellidoPaterno, apellidoMaterno, grado, departamento, provincia, distrito, celular, genero, fechaNacimiento, cineplanetFavorito, empleado, puntos) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Error en prepare: ' . $conexion->error]);
    exit;
}

$stmt->bind_param(
    'isssssssssssi',
    $datos['idUsuario'],
    $passwordHash,
    $datos['apellidoPaterno'],
    $datos['apellidoMaterno'],
    $grado,
    $datos['departamento'] ?? null,
    $datos['provincia'] ?? null,
    $datos['distrito'] ?? null,
    $datos['celular'] ?? null,
    $datos['genero'] ?? null,
    $datos['fechaNacimiento'] ?? null,
    $datos['cineplanetFavorito'] ?? null,
    $empleado,
    $puntos
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Socio creado', 'id' => $datos['idUsuario']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al crear: ' . $stmt->error]);
}
$stmt->close();
?>
