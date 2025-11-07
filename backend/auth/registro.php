<?php
session_start();
require_once '../config/conexion.php';

// Detecta si la petición es JSON
if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    $input = $_POST;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recoge los datos del formulario
    $tipoDocumento = $input['tipoDocumento'] ?? '';
    $numeroDocumento = $input['numeroDocumento'] ?? '';
    $email = $input['email'] ?? '';
    $nombre = $input['nombre'] ?? '';
    $apellidoPaterno = $input['apellidoPaterno'] ?? '';
    $apellidoMaterno = $input['apellidoMaterno'] ?? '';
    $password = $input['password'] ?? '';
    $confirm_password = $input['confirm_password'] ?? '';
    $fechaNacimiento = $input['fechaNacimiento'] ?? '';
    $celular = $input['celular'] ?? '';
    $departamento = $input['departamento'] ?? '';
    $provincia = $input['provincia'] ?? '';
    $distrito = $input['distrito'] ?? '';
    $cineplanetFavorito = $input['cineplanetFavorito'] ?? '';
    $genero = $input['genero'] ?? '';
    $acepta_terminos = !empty($input['acepta_terminos']);
    $acepta_finalidades = !empty($input['acepta_finalidades']);

    // Validación básica
    if (!$acepta_terminos || !$acepta_finalidades) {
        echo "Debes aceptar los términos y finalidades.";
        exit;
    }
    if ($password !== $confirm_password) {
        echo "Las contraseñas no coinciden.";
        exit;
    }

    $conn = conexion::conectar();

    // Validar si el email o número de documento ya existen
    $stmt_check = $conn->prepare("SELECT id FROM USUARIO WHERE email = ? OR numeroDocumento = ?");
    $stmt_check->bind_param("ss", $email, $numeroDocumento);
    $stmt_check->execute();
    $stmt_check->store_result();
    if ($stmt_check->num_rows > 0) {
        echo "El correo o número de documento ya está registrado.";
        $stmt_check->close();
        exit;
    }
    $stmt_check->close();

    // 1. Crear usuario usando procedimiento almacenado
    $stmt = $conn->prepare("CALL usuario_create(?, ?, ?, ?, @idUsuario)");
    $stmt->bind_param("ssss", $nombre, $email, $tipoDocumento, $numeroDocumento);
    $stmt->execute();
    $stmt->close();

    // Obtener el id generado
    $result = $conn->query("SELECT @idUsuario AS idUsuario");
    $row = $result->fetch_assoc();
    $idUsuario = $row['idUsuario'];

    // 2. Crear socio usando procedimiento almacenado (sin cp)
    $stmt2 = $conn->prepare("CALL socio_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'clasico')");
    $stmt2->bind_param(
        "issssssssss", // 11 parámetros: 1 int, 10 strings
        $idUsuario,           // idUsuario
        $password,            // password
        $departamento,        // departamento
        $provincia,           // provincia
        $distrito,            // distrito
        $apellidoPaterno,     // apellidoPaterno
        $apellidoMaterno,     // apellidoMaterno
        $cineplanetFavorito,  // cineplanetFavorito
        $fechaNacimiento,     // fechaNacimiento
        $celular,             // celular
        $genero               // genero
    );
    $stmt2->execute();
    $stmt2->close();

    echo "Registro exitoso. Ahora puedes iniciar sesión.";
}
?>
