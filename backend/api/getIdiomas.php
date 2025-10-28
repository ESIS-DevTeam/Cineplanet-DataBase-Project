<?php
require_once "../business/idiomaBusiness.php";

$idiomas = IdiomaBusiness::obtenerIdiomas();

header("Content-Type: application/json");
echo json_encode($idiomas);
?>
