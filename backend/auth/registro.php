<?php
require_once '../config/conexion.php';

header('Content-Type: application/json');

try {
    // Recibe datos del formulario
    $tipoDocumento = $_POST['tipoDocumento'] ?? '';
    $numeroDocumento = $_POST['numeroDocumento'] ?? '';
    $email = $_POST['email'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $apellidoPaterno = $_POST['apellidoPaterno'] ?? '';
    $apellidoMaterno = $_POST['apellidoMaterno'] ?? '';
    $password = $_POST['password'] ?? '';
    $fechaNacimiento = $_POST['fechaNacimiento'] ?? '';
    $celular = $_POST['celular'] ?? '';
    $departamento = $_POST['departamento'] ?? '';
    $provincia = $_POST['provincia'] ?? '';
    $distrito = $_POST['distrito'] ?? '';
    $cineplanetFavorito = $_POST['cineplanetFavorito'] ?? '';
    $genero = $_POST['genero'] ?? '';

    $conn = conexion::conectar();
    if (!$conn || $conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos.");
    }
    $conn->set_charset("utf8");

    // Verifica si el usuario existe por tipoDocumento y numeroDocumento
    $stmt = $conn->prepare("SELECT id FROM USUARIO WHERE tipoDocumento = ? AND numeroDocumento = ?");
    if (!$stmt) throw new Exception("Error en la consulta USUARIO.");
    $stmt->bind_param("ss", $tipoDocumento, $numeroDocumento);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Usuario existe
        $stmt->bind_result($idUsuario);
        $stmt->fetch();

        // Verifica si ya existe en SOCIO
        $stmtSocio = $conn->prepare("SELECT id FROM SOCIO WHERE id=?");
        if (!$stmtSocio) throw new Exception("Error en la consulta SOCIO.");
        $stmtSocio->bind_param("i", $idUsuario);
        $stmtSocio->execute();
        $stmtSocio->store_result();

        if ($stmtSocio->num_rows > 0) {
            // Ya es socio, no se puede registrar
            echo json_encode(['success' => false, 'message' => 'Ya existe una cuenta asociada a este documento.']);
            exit;
        } else {
            // Actualiza datos en USUARIO
            $updateUsuario = $conn->prepare("UPDATE USUARIO SET nombre=?, email=?, tipo='cliente' WHERE id=?");
            if (!$updateUsuario) throw new Exception("Error al actualizar USUARIO.");
            $updateUsuario->bind_param("ssi", $nombre, $email, $idUsuario);
            $updateUsuario->execute();

            // Inserta en SOCIO
            $insertSocio = $conn->prepare("INSERT INTO SOCIO (id, password, departamento, provincia, distrito, apellidoPaterno, apellidoMaterno, cineplanetFavorito, fechaNacimiento, celular, genero) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            if (!$insertSocio) throw new Exception("Error al insertar en SOCIO.");
            $insertSocio->bind_param("issssssssss", $idUsuario, $password, $departamento, $provincia, $distrito, $apellidoPaterno, $apellidoMaterno, $cineplanetFavorito, $fechaNacimiento, $celular, $genero);
            $insertSocio->execute();

            echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente', 'idUsuario' => $idUsuario]);
            exit;
        }
    } else {
        // Usuario no existe, inserta en USUARIO
        $tipo = 'cliente';
        $insertUsuario = $conn->prepare("INSERT INTO USUARIO (nombre, email, tipoDocumento, numeroDocumento, tipo) VALUES (?, ?, ?, ?, ?)");
        if (!$insertUsuario) throw new Exception("Error al preparar inserción en USUARIO.");
        $insertUsuario->bind_param("sssss", $nombre, $email, $tipoDocumento, $numeroDocumento, $tipo);
        if (!$insertUsuario->execute()) {
            // Envía el mensaje de error tal cual
            echo json_encode(['success' => false, 'message' => $conn->error]);
            exit;
        }
        $idUsuario = $conn->insert_id;

        // Inserta en SOCIO
        $insertSocio = $conn->prepare("INSERT INTO SOCIO (id, password, departamento, provincia, distrito, apellidoPaterno, apellidoMaterno, cineplanetFavorito, fechaNacimiento, celular, genero) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        if (!$insertSocio) throw new Exception("Error al insertar en SOCIO.");
        $insertSocio->bind_param("issssssssss", $idUsuario, $password, $departamento, $provincia, $distrito, $apellidoPaterno, $apellidoMaterno, $cineplanetFavorito, $fechaNacimiento, $celular, $genero);
        $insertSocio->execute();

        echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente', 'idUsuario' => $idUsuario]);
        exit;
    }
} catch (Exception $ex) {
    echo json_encode(['success' => false, 'message' => $ex->getMessage()]);
    exit;
}
?>
