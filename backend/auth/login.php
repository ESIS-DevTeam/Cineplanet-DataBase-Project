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
        // Usa el operador ?? null para evitar warnings si el campo no existe
        $_SESSION['socio'] = [
            'id' => $row['id'] ?? null,
            'nombre' => $row['nombre'] ?? null,
            'email' => $row['email'] ?? null,
            'tipoDocumento' => $row['tipoDocumento'] ?? null,
            'numeroDocumento' => $row['numeroDocumento'] ?? null,
            'departamento' => $row['departamento'] ?? null,
            'provincia' => $row['provincia'] ?? null,
            'distrito' => $row['distrito'] ?? null,
            'apellidoPaterno' => $row['apellidoPaterno'] ?? null,
            'apellidoMaterno' => $row['apellidoMaterno'] ?? null,
            'cineplanetFavorito' => $row['cineplanetFavorito'] ?? null,
            'fechaNacimiento' => $row['fechaNacimiento'] ?? null,
            'celular' => $row['celular'] ?? null,
            'genero' => $row['genero'] ?? null,
            'puntos' => $row['puntos'] ?? null,
            'visitas' => $row['visitas'] ?? null,
            'empleado' => $row['empleado'] ?? null,
            'grado' => $row['grado'] ?? null
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
