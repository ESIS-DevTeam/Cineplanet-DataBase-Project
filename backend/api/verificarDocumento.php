<?php
require_once("../config/conexion.php");
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$tipoDocumento = $data['tipoDocumento'] ?? '';
$numeroDocumento = $data['numeroDocumento'] ?? '';
$nombreCompleto = $data['nombreCompleto'] ?? '';
$email = $data['correoElectronico'] ?? '';

$conn = conexion::conectar();

// Buscar usuario por tipo y número de documento
$stmt = $conn->prepare("SELECT id FROM USUARIO WHERE tipoDocumento=? AND numeroDocumento=?");
$stmt->bind_param("ss", $tipoDocumento, $numeroDocumento);
$stmt->execute();
$res = $stmt->get_result();
$usuario = $res->fetch_assoc();

if ($usuario) {
    $idUsuario = $usuario['id'];
    // Verificar si está asociado a socio
    $stmt2 = $conn->prepare("SELECT id FROM SOCIO WHERE id=?");
    $stmt2->bind_param("i", $idUsuario);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    if ($res2->fetch_assoc()) {
        echo json_encode([
            'status' => 'socio',
            'message' => 'El documento está asociado a una cuenta de socio. Por favor, inicie sesión para continuar.'
        ]);
        exit;
    } else {
        // Usuario existe pero no es socio
        echo json_encode([
            'status' => 'usuario',
            'idUsuario' => $idUsuario,
            'message' => 'Usuario registrado, puede continuar con el pago.'
        ]);
        exit;
    }
} else {
    // Insertar nuevo usuario
    $stmt3 = $conn->prepare("INSERT INTO USUARIO (nombre, email, tipoDocumento, numeroDocumento) VALUES (?, ?, ?, ?)");
    $stmt3->bind_param("ssss", $nombreCompleto, $email, $tipoDocumento, $numeroDocumento);
    if ($stmt3->execute()) {
        $idUsuario = $stmt3->insert_id;
        echo json_encode([
            'status' => 'insertado',
            'idUsuario' => $idUsuario,
            'message' => 'Usuario registrado correctamente, puede continuar con el pago.'
        ]);
        exit;
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No se pudo registrar el usuario.'
        ]);
        exit;
    }
}
?>
