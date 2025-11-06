--------------------------------------

DROP TABLE IF EXISTS USUARIO;
CREATE TABLE USUARIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    tipoDocumento VARCHAR(20) NOT NULL,
    numeroDocumento VARCHAR(20) UNIQUE NOT NULL
);

-- CIUDAD: normalización de ciudades para CINE
DROP TABLE IF EXISTS CIUDAD;
CREATE TABLE CIUDAD (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS CINE;
CREATE TABLE CINE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    -- referencia normalizada a CIUDAD
    idCiudad INT NULL,
    FOREIGN KEY (idCiudad) REFERENCES CIUDAD(id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS GENERO;
CREATE TABLE GENERO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS RESTRICCION;
CREATE TABLE RESTRICCION (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS PELICULA;
CREATE TABLE PELICULA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    genero INT NOT NULL,
    duracion INT,
    restriccion INT NOT NULL,
    restriccionComercial TINYINT(1) DEFAULT 1,
    sinopsis TEXT,
    autor VARCHAR(100),
    trailer VARCHAR(255),
    portada VARCHAR(255),
    estado ENUM('activa', 'inactiva') DEFAULT 'activa',
    FOREIGN KEY (genero) REFERENCES GENERO(id) ON DELETE CASCADE,
    FOREIGN KEY (restriccion) REFERENCES RESTRICCION(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS FORMATO;
CREATE TABLE FORMATO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS PRODUCTO;
CREATE TABLE PRODUCTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(5,2) NOT NULL,
    imagen VARCHAR(255),
    tipo VARCHAR(50)
);

DROP TABLE IF EXISTS PROMO;
CREATE TABLE PROMO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    -- tipo de promo: porcentaje (valor = 10 => 10%) o fijo (valor = 5 => 5 unidades monetarias)
    tipo ENUM('porcentaje','fijo') DEFAULT 'fijo',
    valor DECIMAL(10,2) DEFAULT 0,
    -- aplicaA indica si la promo se aplica a todos los items, solo productos o solo funciones
    aplicaA ENUM('todo','productos','funciones') DEFAULT 'todo',
    estado ENUM('activa', 'inactiva') DEFAULT 'activa'
);

DROP TABLE IF EXISTS SOCIO;
CREATE TABLE SOCIO (
    id INT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    departamento VARCHAR(50),
    provincia VARCHAR(50),
    distrito VARCHAR(50),
    apellidoPaterno VARCHAR(100) NOT NULL,
    apellidoMaterno VARCHAR(100) NOT NULL,
    cineplanetFavorito VARCHAR(50),
    fechaNacimiento DATE,
    celular VARCHAR(20),
    genero VARCHAR(10),
    grado ENUM('clasico','plata','oro','black') NOT NULL DEFAULT 'clasico',
    FOREIGN KEY (id) REFERENCES USUARIO(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS SALA;
CREATE TABLE SALA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    capacidad INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    idCine INT NOT NULL,
    FOREIGN KEY (idCine) REFERENCES CINE(id) ON DELETE CASCADE
);

-- ASIENTO: cada asiento pertenece a una SALA, identificado por (idSala, fila, numero)
DROP TABLE IF EXISTS PLANO_SALA;
CREATE TABLE PLANO_SALA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idSala INT NOT NULL,
    fila CHAR(1) NOT NULL,     -- letra (A, B, C, ...)
    numero INT NOT NULL,       -- número del asiento (1, 2, 3, ...)
    tipo ENUM('normal','discapacidad','pasillo') DEFAULT 'normal',
    FOREIGN KEY (idSala) REFERENCES SALA(id) ON DELETE CASCADE,
    CONSTRAINT uq_asiento_sala UNIQUE (idSala, fila, numero)
);

DROP TABLE IF EXISTS PELICULA_FORMATO;
CREATE TABLE PELICULA_FORMATO (
    idPelicula INT NOT NULL,
    idFormato INT NOT NULL,
    PRIMARY KEY (idPelicula, idFormato),
    FOREIGN KEY (idPelicula) REFERENCES PELICULA(id) ON DELETE CASCADE,
    FOREIGN KEY (idFormato) REFERENCES FORMATO(id) ON DELETE CASCADE
);

-- Normalización de idiomas: una película puede tener varios idiomas, y una función también
DROP TABLE IF EXISTS IDIOMA;
CREATE TABLE IDIOMA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS PELICULA_IDIOMA;
CREATE TABLE PELICULA_IDIOMA (
    idPelicula INT NOT NULL,
    idIdioma INT NOT NULL,
    PRIMARY KEY (idPelicula, idIdioma),
    FOREIGN KEY (idPelicula) REFERENCES PELICULA(id) ON DELETE CASCADE,
    FOREIGN KEY (idIdioma) REFERENCES IDIOMA(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS FUNCION;
CREATE TABLE FUNCION (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idPelicula INT NOT NULL,
    idSala INT NOT NULL,
    idFormato INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    precio DECIMAL(6,2) NOT NULL,
    -- cada función tiene un solo idioma (idIdioma puede ser NULL si no se especifica)
    idIdioma INT NULL,
    estado ENUM('activa', 'inactiva') DEFAULT 'activa',
    FOREIGN KEY (idPelicula) REFERENCES PELICULA(id) ON DELETE CASCADE,
    FOREIGN KEY (idSala) REFERENCES SALA(id) ON DELETE CASCADE,
    FOREIGN KEY (idFormato) REFERENCES FORMATO(id) ON DELETE CASCADE,
    FOREIGN KEY (idIdioma) REFERENCES IDIOMA(id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS BOLETA;
CREATE TABLE BOLETA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    fecha DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    descuentoTotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(id) ON DELETE CASCADE
);

-- BOLETA_ASIENTO: registra qué asiento se vendió para una boleta y función
-- Se asegura que un mismo asiento no sea asignado a la misma función más de una vez
DROP TABLE IF EXISTS BOLETA_ASIENTO;
CREATE TABLE BOLETA_ASIENTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idBoleta INT NOT NULL,
    idFuncion INT NOT NULL,
    idPlanoSala INT NOT NULL,  -- referencia al asiento dentro del plano
    precioUnitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (idBoleta) REFERENCES BOLETA(id) ON DELETE CASCADE,
    FOREIGN KEY (idFuncion) REFERENCES FUNCION(id) ON DELETE CASCADE,
    FOREIGN KEY (idPlanoSala) REFERENCES PLANO_SALA(id) ON DELETE CASCADE,
    CONSTRAINT uq_funcion_asiento UNIQUE (idFuncion, idPlanoSala)
);

DROP TABLE IF EXISTS PRODUCTOS_BOLETA;
CREATE TABLE PRODUCTOS_BOLETA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idBoleta INT NOT NULL,
    idProducto INT NOT NULL,
    cantidad INT DEFAULT 1,
    precioUnitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) AS (cantidad * precioUnitario) STORED,
    FOREIGN KEY (idBoleta) REFERENCES BOLETA(id) ON DELETE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES PRODUCTO(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS PROMO_BOLETA;
CREATE TABLE PROMO_BOLETA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idBoleta INT NOT NULL,
    idPromo INT NOT NULL,
    montoDescuento DECIMAL(10,2) DEFAULT 0,
    detalle VARCHAR(255),
    FOREIGN KEY (idBoleta) REFERENCES BOLETA(id) ON DELETE CASCADE,
    FOREIGN KEY (idPromo) REFERENCES PROMO(id) ON DELETE CASCADE
);

