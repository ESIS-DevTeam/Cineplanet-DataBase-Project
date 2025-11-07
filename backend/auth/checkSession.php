<?php
session_start();
if (isset($_SESSION['socio'])) {
    echo json_encode(['loggedIn' => true, 'socio' => $_SESSION['socio']]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>
