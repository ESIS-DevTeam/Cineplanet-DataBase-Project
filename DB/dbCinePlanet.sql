-- Primero las tablas sin dependencias
CREATE TABLE USUARIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    tipoDocumento VARCHAR(20) NOT NULL,
    numeroDocumento VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE CINE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    ciudad VARCHAR(50)
);

CREATE TABLE PELICULA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    genero VARCHAR(100),
    duracion INT,
    restriccionEdad VARCHAR(20),
    restriccionComercial VARCHAR(50),
    sinopsis TEXT,
    autor VARCHAR(100),
    trailer VARCHAR(255),
    portada VARCHAR(255),
    idioma VARCHAR(50),
    estado ENUM('activa', 'inactiva') DEFAULT 'activa'
);

CREATE TABLE FORMATO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE PRODUCTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(5,2) NOT NULL,
    imagen VARCHAR(255),
    tipo VARCHAR(50)
);

CREATE TABLE PROMO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,  
    fecha_fin DATE,
    estado ENUM('activa', 'inactiva') DEFAULT 'activa'
);

-- Luego las que dependen de las anteriores
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
    genero VARCHAR(10)
    FOREIGN KEY (id) REFERENCES USUARIO(id) ON DELETE CASCADE
);

CREATE TABLE SALA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    capacidad INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    idCine INT NOT NULL,
    FOREIGN KEY (idCine) REFERENCES CINE(id) ON DELETE CASCADE
);

CREATE TABLE PELICULA_FORMATO (
    idPelicula INT NOT NULL,
    idFormato INT NOT NULL,
    PRIMARY KEY (idPelicula, idFormato),
    FOREIGN KEY (idPelicula) REFERENCES PELICULA(id) ON DELETE CASCADE,
    FOREIGN KEY (idFormato) REFERENCES FORMATO(id) ON DELETE CASCADE
);

-- Tabla FUNCION para funciones de cine
CREATE TABLE FUNCION (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idPelicula INT NOT NULL,
    idSala INT NOT NULL,
    idFormato INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    precio DECIMAL(6,2) NOT NULL,
    estado ENUM('activa', 'inactiva') DEFAULT 'activa',
    FOREIGN KEY (idPelicula) REFERENCES PELICULA(id) ON DELETE CASCADE,
    FOREIGN KEY (idSala) REFERENCES SALA(id) ON DELETE CASCADE,
    FOREIGN KEY (idFormato) REFERENCES FORMATO(id) ON DELETE CASCADE
);

CREATE TABLE BOLETA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    fecha DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(id) ON DELETE CASCADE
);

CREATE TABLE PRODUCTOS_BOLETA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idBoleta INT NOT NULL,
    idProducto INT NOT NULL,
    cantidad INT DEFAULT 1,
    FOREIGN KEY (idBoleta) REFERENCES BOLETA(id) ON DELETE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES PRODUCTO(id) ON DELETE CASCADE
);

-- Relación de funciones compradas en una boleta
CREATE TABLE FUNCIONES_BOLETA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idBoleta INT NOT NULL,
    idFuncion INT NOT NULL,
    cantidad INT DEFAULT 1,
    FOREIGN KEY (idBoleta) REFERENCES BOLETA(id) ON DELETE CASCADE,
    FOREIGN KEY (idFuncion) REFERENCES FUNCION(id) ON DELETE CASCADE
);

    -- Relación de promociones aplicadas a una boleta
    CREATE TABLE PROMO_BOLETA (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idBoleta INT NOT NULL,
        idPromo INT NOT NULL,
        montoDescuento DECIMAL(10,2) DEFAULT 0,
        detalle VARCHAR(255),
        FOREIGN KEY (idBoleta) REFERENCES BOLETA(id) ON DELETE CASCADE,
        FOREIGN KEY (idPromo) REFERENCES PROMO(id) ON DELETE CASCADE
    );
