<?php
require_once "../config/conexion.php";
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$required = ['idUsuario', 'fecha', 'subtotal', 'descuentoTotal', 'total'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        echo json_encode(['success' => false, 'message' => "Falta el campo: $field"]);
        exit;
    }
}

$conn = conexion::conectar();
$conn->begin_transaction();

try {
    // Insertar boleta
    $stmt = $conn->prepare("INSERT INTO BOLETA (idUsuario, fecha, subtotal, descuentoTotal, total) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issdd", $data['idUsuario'], $data['fecha'], $data['subtotal'], $data['descuentoTotal'], $data['total']);
    $stmt->execute();
    $idBoleta = $conn->insert_id;
    $stmt->close();

    // Insertar productos boleta
    if (!empty($data['productosBoleta'])) {
        $stmt = $conn->prepare("INSERT INTO PRODUCTOS_BOLETA (idBoleta, idProducto, cantidad, precioUnitario) VALUES (?, ?, ?, ?)");
        foreach ($data['productosBoleta'] as $prod) {
            $stmt->bind_param("iiid", $idBoleta, $prod['idProducto'], $prod['cantidad'], $prod['precioUnitario']);
            $stmt->execute();
        }
        $stmt->close();
    }

    // Insertar promos boleta
    if (!empty($data['promosBoleta'])) {
        $stmt = $conn->prepare("INSERT INTO PROMO_BOLETA (idBoleta, idPromo, montoDescuento, cantidad, detalle) VALUES (?, ?, ?, ?, ?)");
        foreach ($data['promosBoleta'] as $promo) {
            $detalle = isset($promo['detalle']) ? $promo['detalle'] : '';
            $cantidad = isset($promo['cantidad']) ? $promo['cantidad'] : 1;
            $stmt->bind_param("iidis", $idBoleta, $promo['idPromo'], $promo['montoDescuento'], $cantidad, $detalle);
            $stmt->execute();
        }
        $stmt->close();
    }

    // Insertar asientos boleta
    if (!empty($data['asientosBoleta']) && !empty($data['idFuncion'])) {
        $stmt = $conn->prepare("INSERT INTO BOLETA_ASIENTO (idBoleta, idFuncion, idPlanoSala, precioUnitario) VALUES (?, ?, ?, ?)");
        foreach ($data['asientosBoleta'] as $asiento) {
            $stmt->bind_param("iiid", $idBoleta, $data['idFuncion'], $asiento['idPlanoSala'], $asiento['precioUnitario']);
            $stmt->execute();
        }
        $stmt->close();
    }

    $conn->commit();
    echo json_encode(['success' => true, 'idBoleta' => $idBoleta]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
