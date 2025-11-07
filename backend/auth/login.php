<?php
session_start();
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $numeroDocumento = $_POST['numeroDocumento'] ?? '';
    $password = $_POST['password'] ?? '';

    $conn = conexion::conectar();

    // Llama al procedimiento socio_login
    $stmt = $conn->prepare("CALL socio_login(?, ?)");
    $stmt->bind_param("ss", $numeroDocumento, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Login exitoso, guarda datos en sesión
        $_SESSION['idUsuario'] = $row['id'];
        $_SESSION['nombre'] = $row['nombre'];
        $_SESSION['email'] = $row['email'];
        $_SESSION['esSocio'] = true;
        $_SESSION['grado'] = $row['grado'];
        $_SESSION['empleado'] = $row['empleado'];
        header("Location: ../../frontend/pages/index.html"); // Redirige al inicio
        exit;
    } else {
        // Login fallido
        echo "Usuario o contraseña incorrectos.";
    }
    $stmt->close();
}
?>
