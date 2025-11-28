<?php
header('Content-Type: application/json');
date_default_timezone_set('America/Lima'); // <-- Fuerza zona horaria Perú
require_once '../../../config/conexion.php';

$conexion = conexion::conectar();
$idSala = $_GET['idSala'] ?? null;
$idPelicula = $_GET['idPelicula'] ?? null;

try {
    if (!$idSala || !$idPelicula) {
        throw new Exception("idSala e idPelicula son requeridos");
    }
    
    // Obtener duración de la película
    $sqlPelicula = "SELECT duracion FROM PELICULA WHERE id = ?";
    $stmtPelicula = $conexion->prepare($sqlPelicula);
    $stmtPelicula->bind_param("i", $idPelicula);
    $stmtPelicula->execute();
    $resultPelicula = $stmtPelicula->get_result();
    
    if ($resultPelicula->num_rows === 0) {
        throw new Exception("Película no encontrada");
    }
    
    $pelicula = $resultPelicula->fetch_assoc();
    $duracion = $pelicula['duracion'] ?? 120; // 120 min por defecto
    $tiempoLimpieza = 15; // minutos entre funciones
    $tiempoTotal = $duracion + $tiempoLimpieza;
    
    // Obtener todas las funciones de esta sala en los próximos 30 días
    $hoy = date('Y-m-d');
    error_log("DEBUG DISPONIBILIDAD - Fecha hoy: $hoy"); // <-- Agrega esto para depurar
    $hace30Dias = date('Y-m-d', strtotime('+30 days'));
    
    $sqlFunciones = "SELECT 
                        f.id, f.fecha, f.hora,
                        p.duracion as duracionPelicula
                    FROM FUNCION f
                    LEFT JOIN PELICULA p ON f.idPelicula = p.id
                    WHERE f.idSala = ? 
                    AND f.fecha BETWEEN ? AND ?
                    AND f.estado != 'inactiva'
                    ORDER BY f.fecha ASC, f.hora ASC";
    
    $stmtFunciones = $conexion->prepare($sqlFunciones);
    $stmtFunciones->bind_param("iss", $idSala, $hoy, $hace30Dias);
    $stmtFunciones->execute();
    $resultFunciones = $stmtFunciones->get_result();
    
    $funcionesExistentes = [];
    while ($row = $resultFunciones->fetch_assoc()) {
        $funcionesExistentes[] = $row;
    }
    
    // Generar horarios disponibles
    $horariosDisponibles = generarHorariosDisponibles($funcionesExistentes, $tiempoTotal);
    
    echo json_encode([
        'success' => true, 
        'duracion' => $duracion,
        'tiempoTotal' => $tiempoTotal,
        'funcionesExistentes' => $funcionesExistentes,
        'horariosDisponibles' => $horariosDisponibles
    ]);
    
    $stmtPelicula->close();
    $stmtFunciones->close();
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function generarHorariosDisponibles($funciones, $tiempoTotal) {
    $horariosDisponibles = [];
    $horariosApertura = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];
    
    // Agrupar funciones por fecha
    $funcionesPorFecha = [];
    foreach ($funciones as $f) {
        $fecha = $f['fecha'];
        if (!isset($funcionesPorFecha[$fecha])) {
            $funcionesPorFecha[$fecha] = [];
        }
        $funcionesPorFecha[$fecha][] = $f;
    }
    
    // Para los próximos 30 días
    $hoy = new DateTime();
    for ($i = 0; $i < 30; $i++) {
        $fecha = $hoy->format('Y-m-d');
        $horariosDisponibles[$fecha] = [];
        
        // Si hay funciones en esta fecha, filtrar horarios disponibles
        if (isset($funcionesPorFecha[$fecha])) {
            $funcionesFecha = $funcionesPorFecha[$fecha];
            
            foreach ($horariosApertura as $horario) {
                if (esHorarioDisponible($horario, $funcionesFecha, $tiempoTotal)) {
                    $horariosDisponibles[$fecha][] = $horario;
                }
            }
        } else {
            // Si no hay funciones, todos los horarios están disponibles
            $horariosDisponibles[$fecha] = $horariosApertura;
        }
        
        $hoy->add(new DateInterval('P1D'));
    }
    
    return $horariosDisponibles;
}

function esHorarioDisponible($horario, $funciones, $tiempoTotal) {
    list($horas, $minutos) = explode(':', $horario);
    $horaInicio = $horas * 60 + $minutos; // convertir a minutos
    $horaFin = $horaInicio + ($tiempoTotal);
    
    foreach ($funciones as $f) {
        list($horas_f, $minutos_f) = explode(':', $f['hora']);
        $duracion = $f['duracionPelicula'] ?? 120;
        $tiempoLimpieza = 15;
        
        $horaExistente = $horas_f * 60 + $minutos_f;
        $horaExistenteFin = $horaExistente + $duracion + $tiempoLimpieza;
        
        // Verificar si hay conflicto
        if (($horaInicio >= $horaExistente && $horaInicio < $horaExistenteFin) ||
            ($horaFin > $horaExistente && $horaFin <= $horaExistenteFin) ||
            ($horaInicio <= $horaExistente && $horaFin >= $horaExistenteFin)) {
            return false;
        }
    }
    
    return true;
}
?>
