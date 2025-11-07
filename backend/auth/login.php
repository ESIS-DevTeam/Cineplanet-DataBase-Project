<?php
session_start();
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $numeroDocumento = $_POST['numeroDocumento'] ?? '';
    $password = $_POST['password'] ?? '';

    $conn = conexion::conectar();
    $stmt = $conn->prepare("CALL socio_login(?, ?)");
    $stmt->bind_param("ss", $numeroDocumento, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $_SESSION['socio'] = [
            'id' => $row['id'],
            'nombre' => $row['nombre'],
            'email' => $row['email'],
            'tipoDocumento' => $row['tipoDocumento'],
            'numeroDocumento' => $row['numeroDocumento'],
            'departamento' => $row['departamento'],
            'provincia' => $row['provincia'],
            'distrito' => $row['distrito'],
            'apellidoPaterno' => $row['apellidoPaterno'],
            'apellidoMaterno' => $row['apellidoMaterno'],
            'cineplanetFavorito' => $row['cineplanetFavorito'],
            'fechaNacimiento' => $row['fechaNacimiento'],
            'celular' => $row['celular'],
            'genero' => $row['genero'],
            'puntos' => $row['puntos'],
            'visitas' => $row['visitas'],
            'empleado' => $row['empleado'],
            'grado' => $row['grado']
        ];
        echo json_encode(['success' => true, 'socio' => $_SESSION['socio']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
    }
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>
