<?php
class Cine {
    public $id;
    public $nombre;
    public $direccion;
    public $telefono;
    public $email;
    public $idCiudad;

    public function __construct($id = null, $nombre = null, $direccion = null, $telefono = null, $email = null, $idCiudad = null) {
        $this->id = $id;
        $this->nombre = $nombre;
        $this->direccion = $direccion;
        $this->telefono = $telefono;
        $this->email = $email;
        $this->idCiudad = $idCiudad;
    }
}
?>
