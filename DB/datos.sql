-- ===========================================
-- 🔹 DATOS DE EJEMPLO PARA CINEPLANET BD
-- ===========================================

-- USUARIOS
INSERT INTO USUARIO (nombre, email, tipoDocumento, numeroDocumento) VALUES
('Carlos Gómez', 'carlos.gomez@gmail.com', 'DNI', '12345678'),
('Ana Torres', 'ana.torres@gmail.com', 'DNI', '87654321'),
('Luis Fernández', 'luis.fernandez@gmail.com', 'DNI', '11223344'),
('María López', 'maria.lopez@gmail.com', 'DNI', '22334455'),
('Pedro Ramos', 'pedro.ramos@gmail.com', 'DNI', '33445566'),
('Lucía Vega', 'lucia.vega@gmail.com', 'DNI', '44556677'),
('Jorge Silva', 'jorge.silva@gmail.com', 'DNI', '55667788'),
('Rosa Díaz', 'rosa.diaz@gmail.com', 'DNI', '66778899'),
('Andrés Castillo', 'andres.castillo@gmail.com', 'DNI', '77889900'),
('Patricia Ríos', 'patricia.rios@gmail.com', 'DNI', '88990011');

-- CIUDAD
INSERT INTO CIUDAD (nombre) VALUES
('Lima'),
('Arequipa'),
('Trujillo'),
('Cusco'),
('Piura'),
('Chiclayo'),
('Huancayo'),
('Tacna'),
('Iquitos'),
('Puno');

-- CINE
INSERT INTO CINE (nombre, direccion, telefono, email, idCiudad) VALUES
('Cineplanet San Miguel', 'Av. La Marina 2000', '012345678', 'sanmiguel@cineplanet.com', 1),
('Cineplanet Arequipa Mall', 'Av. Ejército 1000', '054123456', 'arequipa@cineplanet.com', 2),
('Cineplanet Real Plaza Trujillo', 'Av. Mansiche 777', '044987654', 'trujillo@cineplanet.com', 3),
('Cineplanet Cusco', 'Av. El Sol 300', '084654321', 'cusco@cineplanet.com', 4),
('Cineplanet Piura', 'Av. Grau 456', '073123123', 'piura@cineplanet.com', 5),
('Cineplanet Chiclayo', 'Av. Balta 789', '074456789', 'chiclayo@cineplanet.com', 6),
('Cineplanet Huancayo', 'Av. Ferrocarril 100', '064789456', 'huancayo@cineplanet.com', 7),
('Cineplanet Tacna', 'Av. Bolognesi 900', '052963258', 'tacna@cineplanet.com', 8),
('Cineplanet Iquitos', 'Av. Mariscal Cáceres 400', '065741852', 'iquitos@cineplanet.com', 9),
('Cineplanet Puno', 'Jr. Lima 800', '051123987', 'puno@cineplanet.com', 10);

-- GENERO
INSERT INTO GENERO (nombre) VALUES
('Acción'),
('Comedia'),
('Drama'),
('Terror'),
('Aventura'),
('Animación'),
('Romance'),
('Ciencia Ficción'),
('Fantasía'),
('Documental');

-- RESTRICCION
INSERT INTO RESTRICCION (nombre) VALUES
('APT'),
('14'),
('18'),
('7'),
('13'),
('PG'),
('R'),
('NR'),
('ATP'),
('B15');

-- FORMATO
INSERT INTO FORMATO (nombre) VALUES
('2D'),
('3D'),
('4DX'),
('IMAX'),
('VIP'),
('SUBTITULADO'),
('DOBLADO'),
('HD'),
('DIGITAL'),
('STANDARD');

-- IDIOMA
INSERT INTO IDIOMA (nombre) VALUES
('Español'),
('Inglés'),
('Francés'),
('Portugués'),
('Alemán'),
('Italiano'),
('Japonés'),
('Coreano'),
('Chino'),
('Hindi');

-- PRODUCTO
INSERT INTO PRODUCTO (nombre, descripcion, precio, imagen, tipo) VALUES
('Cancha Grande', 'Cancha de maíz grande', 15.00, 'cancha_grande.jpg', 'comida'),
('Cancha Mediana', 'Cancha de maíz mediana', 10.00, 'cancha_mediana.jpg', 'comida'),
('Canchita Pequeña', 'Cancha de maíz pequeña', 7.00, 'cancha_pequena.jpg', 'comida'),
('Gaseosa Grande', 'Bebida de 1L', 12.00, 'gaseosa_grande.jpg', 'bebida'),
('Gaseosa Mediana', 'Bebida de 500ml', 8.00, 'gaseosa_mediana.jpg', 'bebida'),
('Hot Dog', 'Pan con salchicha', 9.00, 'hotdog.jpg', 'comida'),
('Nachos', 'Con queso y guacamole', 14.00, 'nachos.jpg', 'comida'),
('Combo Familiar', '2 Canchas + 2 Gaseosas + Nachos', 40.00, 'combo_familiar.jpg', 'combo'),
('Combo Pareja', 'Cancha + 2 Gaseosas', 25.00, 'combo_pareja.jpg', 'combo'),
('Agua Mineral', 'Botella de agua 600ml', 6.00, 'agua.jpg', 'bebida');

-- PROMO
INSERT INTO PROMO (
    nombre, descripcion, fecha_inicio, fecha_fin, tipo, valor, aplicaA,
    requiereSocio, gradoMinimo, requiereEmpleado, combinable,
    requierePuntos, puntosNecesarios, estado
) VALUES
-- 1. Descuento Adulto Mayor
('Adulto Mayor 60+', 'Descuento del 20% para personas mayores de 60 años.',
 '2025-01-01', '2025-12-31', 'porcentaje', 20.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 'activa'),

-- 2. Descuento Niños
('Niños 2 a 11 años', 'Descuento del 20% para niños entre 2 y 11 años.',
 '2025-01-01', '2025-12-31', 'porcentaje', 20.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 'activa'),

-- 3. Descuento CONADIS
('Descuento CONADIS', 'Descuento del 40% para personas con carnet CONADIS.',
 '2025-01-01', '2025-12-31', 'porcentaje', 40.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 'activa'),

-- 4. Martes al 50%
('Martes al 50%', 'Descuento del 50% en entradas los días martes.',
 '2025-01-01', '2025-12-31', 'porcentaje', 50.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 'activa'),

-- 5. Entradas Socio
('Socio Cineplanet', 'Descuento del 45% para socios, requiere 5 puntos para canjear.',
 '2025-01-01', '2025-12-31', 'porcentaje', 45.00, 'funciones',
 1, 'clasico', 0, 1,
 1, 5, 'activa'),

-- 6. Universitario
('Pack Universitario', 'Descuento del 35% para estudiantes universitarios.',
 '2025-01-01', '2025-12-31', 'porcentaje', 35.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 'activa'),

-- 7. Fiesta del Cine
('Fiesta del Cine', 'Descuento del 65% en entradas durante la Fiesta del Cine.',
 '2025-01-01', '2025-12-31', 'porcentaje', 65.00, 'funciones',
 0, NULL, 0, 0,
 0, NULL, 'activa'),

-- 8. General
('General', 'Entrada general sin ningún tipo de descuento.',
 '2025-01-01', '2025-12-31', 'porcentaje', 0.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 'activa'),

 --9. empleado
 ('Empleado Cineplanet', 'Descuento del 50% exclusivo para empleados del cine.',
 '2025-01-01', '2025-12-31', 'porcentaje', 50.00, 'funciones',
 0, NULL, 1, 0,
 0, NULL, 'activa');

-- SOCIOS (ligados a los primeros 10 usuarios)
INSERT INTO SOCIO (id, password, departamento, provincia, distrito, apellidoPaterno, apellidoMaterno, cineplanetFavorito, fechaNacimiento, celular, genero, grado)
VALUES
(1, '1234', 'Lima', 'Lima', 'San Miguel', 'Gómez', 'Ruiz', 'Cineplanet San Miguel', '1995-03-10', '999111222', 'M', 'oro'),
(2, 'abcd', 'Arequipa', 'Arequipa', 'Cercado', 'Torres', 'Pérez', 'Cineplanet Arequipa Mall', '1997-06-21', '988777555', 'F', 'plata'),
(3, 'pass3', 'La Libertad', 'Trujillo', 'Centro', 'Fernández', 'Gómez', 'Cineplanet Real Plaza Trujillo', '1990-01-15', '977666555', 'M', 'clasico'),
(4, 'pass4', 'Cusco', 'Cusco', 'Wanchaq', 'López', 'Soto', 'Cineplanet Cusco', '1989-09-09', '955888444', 'F', 'black'),
(5, 'pass5', 'Piura', 'Piura', 'Castilla', 'Ramos', 'Flores', 'Cineplanet Piura', '1998-11-11', '933222111', 'M', 'plata'),
(6, 'pass6', 'Lambayeque', 'Chiclayo', 'Centro', 'Vega', 'Mendoza', 'Cineplanet Chiclayo', '1993-05-03', '966777888', 'F', 'oro'),
(7, 'pass7', 'Junín', 'Huancayo', 'El Tambo', 'Silva', 'Reyes', 'Cineplanet Huancayo', '1994-07-30', '955999111', 'M', 'clasico'),
(8, 'pass8', 'Tacna', 'Tacna', 'Gregorio Albarracín', 'Díaz', 'Campos', 'Cineplanet Tacna', '2000-02-14', '977333444', 'F', 'plata'),
(9, 'pass9', 'Loreto', 'Iquitos', 'Punchana', 'Castillo', 'Vargas', 'Cineplanet Iquitos', '1992-12-25', '966111777', 'M', 'black'),
(10, 'pass10', 'Puno', 'Puno', 'Centro', 'Ríos', 'Salas', 'Cineplanet Puno', '1996-10-05', '955222333', 'F', 'oro');

-- SALAS
INSERT INTO SALA (nombre, capacidad, tipo, idCine) VALUES
('Sala 1', 80, '2D', 1),
('Sala 2', 100, '3D', 1),
('Sala 3', 60, 'VIP', 2),
('Sala 4', 120, 'IMAX', 3),
('Sala 5', 70, 'Standard', 4),
('Sala 6', 90, '4DX', 5),
('Sala 7', 110, '2D', 6),
('Sala 8', 100, '3D', 7),
('Sala 9', 120, '2D', 8),
('Sala 10', 80, 'VIP', 9);

-- PLANO_SALA (solo 2 filas por sala para ejemplo)
INSERT INTO PLANO_SALA (idSala, fila, numero, tipo) VALUES
(1, 'A', 1, 'normal'), (1, 'A', 2, 'vip'),
(2, 'B', 1, 'normal'), (2, 'B', 2, 'vip'),
(3, 'C', 1, 'normal'), (3, 'C', 2, 'vip'),
(4, 'D', 1, 'normal'), (4, 'D', 2, 'vip'),
(5, 'E', 1, 'normal'), (5, 'E', 2, 'vip'),
(6, 'F', 1, 'normal'), (6, 'F', 2, 'vip'),
(7, 'G', 1, 'normal'), (7, 'G', 2, 'vip'),
(8, 'H', 1, 'normal'), (8, 'H', 2, 'vip'),
(9, 'I', 1, 'normal'), (9, 'I', 2, 'vip'),
(10, 'J', 1, 'normal'), (10, 'J', 2, 'vip');

-- PELICULA
INSERT INTO PELICULA (nombre, genero, duracion, restriccion, restriccionComercial, sinopsis, autor, trailer, portada, estado) VALUES
('Avengers: Endgame', 1, 180, 1, 1, 'Los héroes enfrentan a Thanos.', 'Marvel Studios', 'https://youtu.be/TcMBFSGVi1c', 'avengers.jpg', 'activa'),
('Toy Story 4', 6, 100, 1, 1, 'Woody y Buzz viven una nueva aventura.', 'Pixar', 'https://youtu.be/wmiIUN-7qhE', 'toystory4.jpg', 'activa'),
('It: Capítulo 2', 4, 170, 3, 1, 'Regresa Pennywise.', 'Warner Bros', 'https://youtu.be/zqUopiAYdRg', 'it2.jpg', 'activa'),
('Titanic', 7, 195, 1, 1, 'Una historia de amor en el Titanic.', 'James Cameron', 'https://youtu.be/kVrqfYjkTdQ', 'titanic.jpg', 'activa'),
('Avatar', 5, 160, 1, 1, 'Una aventura en Pandora.', 'James Cameron', 'https://youtu.be/5PSNL1qE6VY', 'avatar.jpg', 'activa'),
('John Wick 4', 1, 150, 2, 1, 'John Wick continúa su venganza.', 'Lionsgate', 'https://youtu.be/qEVUtrk8_B4', 'johnwick4.jpg', 'activa'),
('Spider-Man: No Way Home', 8, 150, 2, 1, 'El multiverso se abre.', 'Marvel Studios', 'https://youtu.be/JfVOs4VSpmA', 'spiderman.jpg', 'activa'),
('Coco', 6, 110, 1, 1, 'Un niño viaja al mundo de los muertos.', 'Pixar', 'https://youtu.be/Ga6RYejo6Hk', 'coco.jpg', 'activa'),
('Jurassic World', 5, 125, 2, 1, 'Dinosaurios vuelven a la vida.', 'Universal', 'https://youtu.be/RFinNxS5KN4', 'jurassic.jpg', 'activa'),
('El Conjuro', 4, 112, 3, 1, 'Basado en hechos reales.', 'James Wan', 'https://youtu.be/k10ETZ41q5o', 'conjuro.jpg', 'activa');

-- PELICULA_FORMATO
INSERT INTO PELICULA_FORMATO (idPelicula, idFormato) VALUES
(1,1),(1,2),(2,1),(3,2),(4,1),(5,4),(6,2),(7,1),(8,1),(9,3),(10,2);

-- PELICULA_IDIOMA
INSERT INTO PELICULA_IDIOMA (idPelicula, idIdioma) VALUES
(1,1),(1,2),(2,1),(3,2),(4,1),(5,2),(6,2),(7,1),(8,1),(9,2),(10,2);

-- FUNCION
INSERT INTO FUNCION (idPelicula, idSala, idFormato, fecha, hora, precio, idIdioma, estado) VALUES
(1,1,1,DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 10) DAY),'18:00:00',25.00,1,'activa'),
(2,2,2,DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 10) DAY),'16:00:00',20.00,1,'activa'),
(3,3,2,DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 10) DAY),'21:00:00',30.00,2,'activa'),
(4,4,1,DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 10) DAY),'19:00:00',18.00,1,'activa'),
(5,5,4,DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 10) DAY),'20:30:00',28.00,2,'activa'),
(6,6,2,DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 10) DAY),'22:00:00',27.00,2,'activa'),
(7,7,1,DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 10) DAY),'17:00:00',22.00,1,'activa'),
(8,8,1,DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 10) DAY),'15:00:00',20.00,1,'activa'),
(9,9,3,DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 10) DAY),'18:30:00',26.00,2,'activa'),
(10,10,2,DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 10) DAY),'23:00:00',24.00,2,'activa');


-- BOLETA
INSERT INTO BOLETA (idUsuario, fecha, subtotal, descuentoTotal, total) VALUES
(1,'2025-11-05',50,5,45),
(2,'2025-11-05',60,10,50),
(3,'2025-11-05',40,0,40),
(4,'2025-11-05',70,7,63),
(5,'2025-11-05',80,10,70),
(6,'2025-11-05',30,0,30),
(7,'2025-11-05',55,5,50),
(8,'2025-11-05',60,10,50),
(9,'2025-11-05',45,5,40),
(10,'2025-11-05',90,15,75);

;