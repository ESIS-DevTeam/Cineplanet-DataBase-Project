-- ===========================================
-- 🔹 DATOS DE EJEMPLO PARA CINEPLANET BD
-- ===========================================

-- USUARIOS
INSERT INTO USUARIO (nombre, email, tipoDocumento, numeroDocumento, tipo) VALUES
('Carlos Gómez', 'carlos.gomez@gmail.com', 'DNI', '12345678', 'cliente'),
('Ana Torres', 'ana.torres@gmail.com', 'DNI', '87654321', 'cliente'),
('Luis Fernández', 'luis.fernandez@gmail.com', 'DNI', '11223344', 'cliente'),
('María López', 'maria.lopez@gmail.com', 'DNI', '22334455', 'cliente'),
('Pedro Ramos', 'pedro.ramos@gmail.com', 'DNI', '33445566', 'cliente'),
('Lucía Vega', 'lucia.vega@gmail.com', 'DNI', '44556677', 'cliente'),
('Jorge Silva', 'jorge.silva@gmail.com', 'DNI', '55667788', 'cliente'),
('Rosa Díaz', 'rosa.diaz@gmail.com', 'DNI', '66778899', 'cliente'),
('Andrés Castillo', 'andres.castillo@gmail.com', 'DNI', '77889900', 'cliente'),
('Patricia Ríos', 'patricia.rios@gmail.com', 'DNI', '88990011', 'cliente'),
('Juan Admin', 'admin@cineplanet.com', 'DNI', '99999999', 'admin');

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
INSERT INTO CINE (nombre, direccion, telefono, email, imagen, idCiudad) VALUES
('Cineplanet San Miguel', 'Av. La Marina 2000', '012345678', 'sanmiguel@cineplanet.com', 'cineplanet_san_miguel.jpg', 1),
('Cineplanet Arequipa Mall', 'Av. Ejército 1000', '054123456', 'arequipa@cineplanet.com', 'cineplanet_arequipa_mall.jpg', 2),
('Cineplanet Real Plaza Trujillo', 'Av. Mansiche 777', '044987654', 'trujillo@cineplanet.com', 'cineplanet_real_plaza_trujillo.jpg', 3),
('Cineplanet Cusco', 'Av. El Sol 300', '084654321', 'cusco@cineplanet.com', 'cineplanet_cusco.jpg', 4),
('Cineplanet Piura', 'Av. Grau 456', '073123123', 'piura@cineplanet.com', 'cineplanet_piura.jpg', 5),
('Cineplanet Chiclayo', 'Av. Balta 789', '074456789', 'chiclayo@cineplanet.com', 'cineplanet_chiclayo.jpg', 6),
('Cineplanet Huancayo', 'Av. Ferrocarril 100', '064789456', 'huancayo@cineplanet.com', 'cineplanet_huancayo.jpg', 7),
('Cineplanet Tacna', 'Av. Bolognesi 900', '052963258', 'tacna@cineplanet.com', 'cineplanet_tacna.jpg', 8),
('Cineplanet Iquitos', 'Av. Mariscal Cáceres 400', '065741852', 'iquitos@cineplanet.com', 'cineplanet_iquitos.jpg', 9),
('Cineplanet Puno', 'Jr. Lima 800', '051123987', 'puno@cineplanet.com', 'cineplanet_puno.jpg', 10);

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
INSERT INTO PRODUCTO 
(nombre, descripcion, precio, imagen, tipo, estado,
 requiereSocio, gradoMinimo, requiereEmpleado,
 canjeaPuntos, puntosNecesarios)
VALUES
-- ============================
-- SNACKS
-- ============================
('Cancha Grande', 'Balde grande de canchita salada', 18.00, 'cancha_grande.jpg', 'snack', 'activo',
 0, NULL, 0, 0, NULL),

('Cancha Mediana', 'Cancha mediana tradicional', 12.00, 'cancha_mediana.jpg', 'snack', 'activo',
 0, NULL, 0, 0, NULL),

-- ============================
-- BEBIDAS
-- ============================
('Gaseosa 12oz', 'Gaseosa pequeña', 7.00, 'gaseosa_12oz.jpg', 'bebida', 'activo',
 0, NULL, 0, 0, NULL),

('Gaseosa 21oz', 'Gaseosa mediana', 10.00, 'gaseosa_21oz.jpg', 'bebida', 'activo',
 0, NULL, 0, 0, NULL),

-- ============================
-- COMBOS GENERALES
-- ============================
('Combo Pareja', 'Cancha grande + 2 gaseosas 21oz', 30.00, 'combo_pareja.jpg', 'combo', 'activo',
 0, NULL, 0, 0, NULL),

-- ============================
-- COMBOS EXCLUSIVOS POR NIVEL DE SOCIO
-- ============================
('Combo Clásico',
 'Cancha mediana + gaseosa 12oz. Disponible para socios clásicos o superior.',
 18.00, 'combo_clasico.jpg', 'combo', 'activo',
 1, 'clasico', 0, 0, NULL),

('Combo Plata',
 'Cancha grande + gaseosa 21oz. Disponible para socios plata o superior.',
 24.00, 'combo_plata.jpg', 'combo', 'activo',
 1, 'plata', 0, 0, NULL),

('Combo Oro',
 'Cancha jumbo + 2 gaseosas medianas. Disponible para socios oro o superior.',
 35.00, 'combo_oro.jpg', 'combo', 'activo',
 1, 'oro', 0, 0, NULL),

('Combo Black',
 'Cancha jumbo + 2 gaseosas + hot dog + nachos. Solo para socios black.',
 49.00, 'combo_black.jpg', 'combo', 'activo',
 1, 'black', 0, 0, NULL),

-- ============================
-- PRODUCTO EXCLUSIVO EMPLEADO + SOCIO
-- ============================
('Combo Empleado Plus', 
 'Combo especial solo para empleados socios',
 15.00, 'combo_empleado.jpg', 'combo', 'activo',
 1, 'clasico', 1, 0, NULL),

-- ============================
-- DULCES
-- ============================
('Chocolate Sublime', 'Sublime clásico 30g', 5.00, 'chocolate_sublime.jpg', 'dulce', 'activo',
 0, NULL, 0, 0, NULL),

-- ============================
-- MERCH
-- ============================
('Vaso Coleccionable', 'Vaso de edición limitada', 25.00, 'vaso_coleccionable.jpg', 'merch', 'activo',
 0, NULL, 0, 0, NULL),

-- ============================
-- COMPLEMENTARIOS
-- ============================
('Extra Mantequilla', 'Shot de mantequilla adicional', 3.00, 'extra_mantequilla.jpg', 'complementario', 'activo',
 0, NULL, 0, 0, NULL),

-- ============================
-- PRODUCTO DE CANJE POR PUNTOS (SOLO SOCIO)
-- ============================
('Gaseosa 12oz (Canje Socio)',
 'Canje exclusivo de gaseosa para socios',
 0.00, 'gaseosa_12oz_canje_socio.jpg', 'bebida', 'activo',
 1, 'clasico', 0, 1, 300);


-- PROMO
INSERT INTO PROMO (
    nombre, descripcion, fecha_inicio, fecha_fin, tipo, valor, aplicaA,
    requiereSocio, gradoMinimo, requiereEmpleado, combinable,
    requierePuntos, puntosNecesarios, tieneStock, stock, estado
) VALUES

-- 1. General
('General', 'Entrada general sin ningún tipo de descuento.',
 '2025-01-01', '2025-12-31', 'porcentaje', 0.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 0, NULL, 'activa'),

-- 2. Descuento Adulto Mayor
('Adulto Mayor 60+', 'Descuento del 20% para personas mayores de 60 años.',
 '2025-01-01', '2025-12-31', 'porcentaje', 20.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 0, NULL, 'activa'),

-- 3. Descuento Niños
('Niños 2 a 11 años', 'Descuento del 20% para niños entre 2 y 11 años.',
 '2025-01-01', '2025-12-31', 'porcentaje', 20.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 0, NULL, 'activa'),

-- 4. Descuento CONADIS
('Descuento CONADIS', 'Descuento del 40% para personas con carnet CONADIS.',
 '2025-01-01', '2025-12-31', 'porcentaje', 40.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 0, NULL, 'activa'),

-- 5. Martes al 50%
('Martes al 50%', 'Descuento del 50% en entradas los días martes.',
 '2025-01-01', '2025-12-31', 'porcentaje', 50.00, 'funciones',
 0, NULL, 0, 1,
 0, NULL, 0, NULL, 'activa'),

-- 6. Entradas Socio
('Socio Cineplanet', 'Descuento del 45% para socios, requiere 5 puntos para canjear.',
 '2025-01-01', '2025-12-31', 'porcentaje', 45.00, 'funciones',
 1, 'clasico', 0, 1,
 1, 5, 0, NULL, 'activa'),

-- 7. Universitario
('Pack Universitario', 'Descuento del 35% para estudiantes universitarios.',
 '2025-01-01', '2025-12-31', 'porcentaje', 35.00, 'funciones',
 1, NULL, 0, 1,
 0, NULL, 0, NULL, 'activa'),

-- 8. Fiesta del Cine
('Fiesta del Cine', 'Entrada especial a S/6 durante la Fiesta del Cine.',
 '2025-01-01', '2025-12-31', 'fijo', 6.00, 'funciones',
 0, NULL, 0, 0,
 0, NULL, 0, NULL, 'activa'),

-- 9. Empleado
('Empleado Cineplanet', 'Descuento del 50% exclusivo para empleados del cine.',
 '2025-01-01', '2025-12-31', 'porcentaje', 50.00, 'funciones',
 1, NULL, 1, 0,
 0, NULL, 0, NULL, 'activa'),

-- 10. Entrada Preventa
('Entrada Preventa', 'Promoción de entrada anticipada a solo S/6. Stock limitado a 3 usos.',
 '2025-01-01', '2025-12-31', 'fijo', 6.00, 'funciones',
 1, 'clasico', 0, 1,
 0, NULL, 1, 3, 'activa');


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
(10, 'pass10', 'Puno', 'Puno', 'Centro', 'Ríos', 'Salas', 'Cineplanet Puno', '1996-10-05', '955222333', 'F', 'oro'),
(11, 'admin123', 'Puno', 'Puno', 'Centro', 'Ríos', 'Salas', 'Cineplanet Puno', '1996-10-05', '955222333', 'F', 'oro');

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

-- PLANO_SALA (4 asientos por sala, 1 discapacidad)
INSERT INTO PLANO_SALA (idSala, fila, numero, tipo) VALUES
-- Sala 1
(1, 'A', 1, 'normal'), (1, 'A', 2, 'normal'), (1, 'A', 3, 'normal'), (1, 'A', 4, 'discapacidad'),
-- Sala 2
(2, 'B', 1, 'normal'), (2, 'B', 2, 'normal'), (2, 'B', 3, 'discapacidad'), (2, 'B', 4, 'normal'),
-- Sala 3
(3, 'C', 1, 'normal'), (3, 'C', 2, 'discapacidad'), (3, 'C', 3, 'normal'), (3, 'C', 4, 'normal'),
-- Sala 4
(4, 'D', 1, 'discapacidad'), (4, 'D', 2, 'normal'), (4, 'D', 3, 'normal'), (4, 'D', 4, 'normal'),
-- Sala 5
(5, 'E', 1, 'normal'), (5, 'E', 2, 'normal'), (5, 'E', 3, 'normal'), (5, 'E', 4, 'discapacidad'),
-- Sala 6
(6, 'F', 1, 'normal'), (6, 'F', 2, 'discapacidad'), (6, 'F', 3, 'normal'), (6, 'F', 4, 'normal'),
-- Sala 7
(7, 'G', 1, 'normal'), (7, 'G', 2, 'normal'), (7, 'G', 3, 'discapacidad'), (7, 'G', 4, 'normal'),
-- Sala 8
(8, 'H', 1, 'discapacidad'), (8, 'H', 2, 'normal'), (8, 'H', 3, 'normal'), (8, 'H', 4, 'normal'),
-- Sala 9
(9, 'I', 1, 'normal'), (9, 'I', 2, 'normal'), (9, 'I', 3, 'normal'), (9, 'I', 4, 'discapacidad'),
-- Sala 10
(10, 'J', 1, 'normal'), (10, 'J', 2, 'normal'), (10, 'J', 3, 'discapacidad'), (10, 'J', 4, 'normal');

-- PELICULA
INSERT INTO PELICULA (nombre, genero, duracion, restriccion, restriccionComercial, sinopsis, autor, trailer, portada, frame, estado) VALUES
('Avengers: Endgame', 1, 180, 1, 1, 'Los héroes enfrentan a Thanos.', 'Marvel Studios', 'https://www.youtube.com/watch?v=xvFZjo5PgG0', 'avengers_endgame.jpg', 'avengers_endgame_frame.jpg', 'activa'),
('Toy Story 4', 6, 100, 1, 1, 'Woody y Buzz viven una nueva aventura.', 'Pixar', 'https://www.youtube.com/watch?v=wmiIUN-7qhE', 'toy_story_4.jpg', 'toy_story_4_frame.jpg', 'activa'),
('It: Capítulo 2', 4, 170, 3, 1, 'Regresa Pennywise.', 'Warner Bros', 'https://www.youtube.com/watch?v=xhJ5P7Up3jA', 'it_capitulo_2.jpg', 'it_capitulo_2_frame.jpg', 'activa'),
('Titanic', 7, 195, 1, 1, 'Una historia de amor en el Titanic.', 'James Cameron', 'https://www.youtube.com/watch?v=kVrqfYjkTdQ', 'titanic.jpg', 'titanic_frame.jpg', 'activa'),
('Avatar', 5, 160, 1, 1, 'Una aventura en Pandora.', 'James Cameron', 'https://www.youtube.com/watch?v=5PSNL1qE6VY', 'avatar.jpg', 'avatar_frame.jpg', 'activa'),
('John Wick 4', 1, 150, 2, 1, 'John Wick continúa su venganza.', 'Lionsgate', 'https://www.youtube.com/watch?v=qEVUtrk8_B4', 'john_wick_4.jpg', 'john_wick_4_frame.jpg', 'activa'),
('Spider-Man: No Way Home', 8, 150, 2, 1, 'El multiverso se abre.', 'Marvel Studios', 'https://www.youtube.com/watch?v=JfVOs4VSpmA', 'spider_man_no_way_home.jpg', 'spider_man_no_way_home_frame.jpg', 'activa'),
('Coco', 6, 110, 1, 1, 'Un niño viaja al mundo de los muertos.', 'Pixar', 'https://www.youtube.com/watch?v=Ga6RYejo6Hk', 'coco.jpg', 'coco_frame.jpg', 'activa'),
('Jurassic World', 5, 125, 2, 1, 'Dinosaurios vuelven a la vida.', 'Universal', 'https://www.youtube.com/watch?v=RFinNxS5KN4', 'jurassic_world.jpg', 'jurassic_world_frame.jpg', 'activa'),
('El Conjuro', 4, 112, 3, 1, 'Basado en hechos reales.', 'James Wan', 'https://www.youtube.com/watch?v=k10ETZ41q5o', 'el_conjuro.jpg', 'el_conjuro_frame.jpg', 'activa');

-- PELICULA_FORMATO
INSERT INTO PELICULA_FORMATO (idPelicula, idFormato) VALUES
(1,1),(1,2),(2,1),(3,2),(4,1),(5,4),(6,2),(7,1),(8,1),(9,3),(10,2);

-- PELICULA_IDIOMA
INSERT INTO PELICULA_IDIOMA (idPelicula, idIdioma) VALUES
(1,1),(1,2),(2,1),(3,2),(4,1),(5,2),(6,2),(7,1),(8,1),(9,2),(10,2);

-- FUNCION (fechas desde HOY hasta 10 días adelante - 9 al 19 de diciembre 2025)
-- Múltiples funciones diarias para cada película, distribuidas en todos los días
INSERT INTO FUNCION (idPelicula, idSala, idFormato, fecha, hora, precio, idIdioma, estado) VALUES
-- ========== DÍA 0 (HOY - 9 dic) ==========
(1,1,1,CURDATE(),'12:00:00',25.00,1,'activa'),
(1,1,1,CURDATE(),'15:30:00',25.00,1,'activa'),
(1,1,1,CURDATE(),'19:00:00',25.00,1,'activa'),
(2,2,2,CURDATE(),'13:00:00',20.00,1,'activa'),
(2,2,2,CURDATE(),'16:00:00',20.00,1,'activa'),
(3,3,2,CURDATE(),'18:30:00',30.00,2,'activa'),
(3,3,2,CURDATE(),'21:30:00',30.00,2,'activa'),
(4,4,1,CURDATE(),'14:00:00',18.00,1,'activa'),
(5,5,4,CURDATE(),'17:00:00',28.00,2,'activa'),

-- ========== DÍA 1 (10 dic) ==========
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 1 DAY),'12:00:00',25.00,1,'activa'),
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 1 DAY),'18:00:00',25.00,1,'activa'),
(2,2,2,DATE_ADD(CURDATE(), INTERVAL 1 DAY),'14:30:00',20.00,1,'activa'),
(3,3,2,DATE_ADD(CURDATE(), INTERVAL 1 DAY),'20:00:00',30.00,2,'activa'),
(4,4,1,DATE_ADD(CURDATE(), INTERVAL 1 DAY),'16:00:00',18.00,1,'activa'),
(5,5,4,DATE_ADD(CURDATE(), INTERVAL 1 DAY),'19:30:00',28.00,2,'activa'),
(6,6,2,DATE_ADD(CURDATE(), INTERVAL 1 DAY),'22:00:00',27.00,2,'activa'),

-- ========== DÍA 2 (11 dic) ==========
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 2 DAY),'13:00:00',25.00,1,'activa'),
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 2 DAY),'19:30:00',25.00,1,'activa'),
(2,2,2,DATE_ADD(CURDATE(), INTERVAL 2 DAY),'15:00:00',20.00,1,'activa'),
(3,3,2,DATE_ADD(CURDATE(), INTERVAL 2 DAY),'18:00:00',30.00,2,'activa'),
(4,4,1,DATE_ADD(CURDATE(), INTERVAL 2 DAY),'21:00:00',18.00,1,'activa'),
(6,6,2,DATE_ADD(CURDATE(), INTERVAL 2 DAY),'16:30:00',27.00,2,'activa'),
(7,7,1,DATE_ADD(CURDATE(), INTERVAL 2 DAY),'14:00:00',22.00,1,'activa'),

-- ========== DÍA 3 (12 dic) ==========
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 3 DAY),'12:30:00',25.00,1,'activa'),
(2,2,2,DATE_ADD(CURDATE(), INTERVAL 3 DAY),'14:00:00',20.00,1,'activa'),
(2,2,2,DATE_ADD(CURDATE(), INTERVAL 3 DAY),'20:30:00',20.00,1,'activa'),
(5,5,4,DATE_ADD(CURDATE(), INTERVAL 3 DAY),'17:00:00',28.00,2,'activa'),
(6,6,2,DATE_ADD(CURDATE(), INTERVAL 3 DAY),'19:00:00',27.00,2,'activa'),
(7,7,1,DATE_ADD(CURDATE(), INTERVAL 3 DAY),'22:00:00',22.00,1,'activa'),
(8,8,1,DATE_ADD(CURDATE(), INTERVAL 3 DAY),'15:30:00',20.00,1,'activa'),

-- ========== DÍA 4 (13 dic) ==========
(3,3,2,DATE_ADD(CURDATE(), INTERVAL 4 DAY),'13:00:00',30.00,2,'activa'),
(3,3,2,DATE_ADD(CURDATE(), INTERVAL 4 DAY),'21:30:00',30.00,2,'activa'),
(4,4,1,DATE_ADD(CURDATE(), INTERVAL 4 DAY),'15:00:00',18.00,1,'activa'),
(5,5,4,DATE_ADD(CURDATE(), INTERVAL 4 DAY),'18:00:00',28.00,2,'activa'),
(6,6,2,DATE_ADD(CURDATE(), INTERVAL 4 DAY),'20:00:00',27.00,2,'activa'),
(8,8,1,DATE_ADD(CURDATE(), INTERVAL 4 DAY),'16:30:00',20.00,1,'activa'),
(9,9,3,DATE_ADD(CURDATE(), INTERVAL 4 DAY),'19:30:00',26.00,2,'activa'),

-- ========== DÍA 5 (14 dic - Sábado) ==========
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 5 DAY),'11:00:00',25.00,1,'activa'),
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 5 DAY),'14:30:00',25.00,1,'activa'),
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 5 DAY),'18:00:00',25.00,1,'activa'),
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 5 DAY),'21:30:00',25.00,1,'activa'),
(2,2,2,DATE_ADD(CURDATE(), INTERVAL 5 DAY),'12:00:00',20.00,1,'activa'),
(2,2,2,DATE_ADD(CURDATE(), INTERVAL 5 DAY),'16:00:00',20.00,1,'activa'),
(2,2,2,DATE_ADD(CURDATE(), INTERVAL 5 DAY),'20:00:00',20.00,1,'activa'),
(7,7,1,DATE_ADD(CURDATE(), INTERVAL 5 DAY),'13:00:00',22.00,1,'activa'),
(7,7,1,DATE_ADD(CURDATE(), INTERVAL 5 DAY),'17:00:00',22.00,1,'activa'),

-- ========== DÍA 6 (15 dic - Domingo) ==========
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 6 DAY),'11:30:00',25.00,1,'activa'),
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 6 DAY),'15:00:00',25.00,1,'activa'),
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 6 DAY),'19:30:00',25.00,1,'activa'),
(3,3,2,DATE_ADD(CURDATE(), INTERVAL 6 DAY),'13:30:00',30.00,2,'activa'),
(3,3,2,DATE_ADD(CURDATE(), INTERVAL 6 DAY),'17:30:00',30.00,2,'activa'),
(5,5,4,DATE_ADD(CURDATE(), INTERVAL 6 DAY),'14:00:00',28.00,2,'activa'),
(8,8,1,DATE_ADD(CURDATE(), INTERVAL 6 DAY),'12:00:00',20.00,1,'activa'),
(8,8,1,DATE_ADD(CURDATE(), INTERVAL 6 DAY),'16:00:00',20.00,1,'activa'),

-- ========== DÍA 7 (16 dic) ==========
(2,2,2,DATE_ADD(CURDATE(), INTERVAL 7 DAY),'14:00:00',20.00,1,'activa'),
(4,4,1,DATE_ADD(CURDATE(), INTERVAL 7 DAY),'17:00:00',18.00,1,'activa'),
(6,6,2,DATE_ADD(CURDATE(), INTERVAL 7 DAY),'19:00:00',27.00,2,'activa'),
(7,7,1,DATE_ADD(CURDATE(), INTERVAL 7 DAY),'21:00:00',22.00,1,'activa'),
(9,9,3,DATE_ADD(CURDATE(), INTERVAL 7 DAY),'15:30:00',26.00,2,'activa'),
(10,10,2,DATE_ADD(CURDATE(), INTERVAL 7 DAY),'18:30:00',24.00,2,'activa'),

-- ========== DÍA 8 (17 dic) ==========
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 8 DAY),'13:00:00',25.00,1,'activa'),
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 8 DAY),'20:00:00',25.00,1,'activa'),
(3,3,2,DATE_ADD(CURDATE(), INTERVAL 8 DAY),'16:00:00',30.00,2,'activa'),
(5,5,4,DATE_ADD(CURDATE(), INTERVAL 8 DAY),'18:30:00',28.00,2,'activa'),
(6,6,2,DATE_ADD(CURDATE(), INTERVAL 8 DAY),'21:00:00',27.00,2,'activa'),
(9,9,3,DATE_ADD(CURDATE(), INTERVAL 8 DAY),'14:30:00',26.00,2,'activa'),

-- ========== DÍA 9 (18 dic) ==========
(2,2,2,DATE_ADD(CURDATE(), INTERVAL 9 DAY),'15:00:00',20.00,1,'activa'),
(4,4,1,DATE_ADD(CURDATE(), INTERVAL 9 DAY),'17:30:00',18.00,1,'activa'),
(7,7,1,DATE_ADD(CURDATE(), INTERVAL 9 DAY),'19:30:00',22.00,1,'activa'),
(8,8,1,DATE_ADD(CURDATE(), INTERVAL 9 DAY),'13:30:00',20.00,1,'activa'),
(10,10,2,DATE_ADD(CURDATE(), INTERVAL 9 DAY),'21:00:00',24.00,2,'activa'),

-- ========== DÍA 10 (19 dic) ==========
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 10 DAY),'12:00:00',19.00,1,'preventa'),
(1,1,1,DATE_ADD(CURDATE(), INTERVAL 10 DAY),'16:00:00',25.00,1,'activa'),
(2,2,2,DATE_ADD(CURDATE(), INTERVAL 10 DAY),'14:00:00',20.00,1,'activa'),
(3,3,2,DATE_ADD(CURDATE(), INTERVAL 10 DAY),'18:00:00',30.00,2,'activa'),
(4,4,1,DATE_ADD(CURDATE(), INTERVAL 10 DAY),'20:00:00',18.00,1,'activa'),
(5,5,4,DATE_ADD(CURDATE(), INTERVAL 10 DAY),'15:30:00',28.00,2,'activa');
-- TOTAL: 90+ funciones distribuidas en 11 días (del 9 al 19 de diciembre)


-- BOLETA (fechas recientes - últimos 7 días)
INSERT INTO BOLETA (idUsuario, fecha, subtotal, descuentoTotal, total) VALUES
(1,DATE_SUB(CURDATE(), INTERVAL 7 DAY),50,5,45),   -- Hace 7 días
(2,DATE_SUB(CURDATE(), INTERVAL 6 DAY),60,10,50),  -- Hace 6 días
(3,DATE_SUB(CURDATE(), INTERVAL 5 DAY),40,0,40),   -- Hace 5 días
(4,DATE_SUB(CURDATE(), INTERVAL 4 DAY),70,7,63),   -- Hace 4 días
(5,DATE_SUB(CURDATE(), INTERVAL 3 DAY),80,10,70),  -- Hace 3 días
(6,DATE_SUB(CURDATE(), INTERVAL 2 DAY),30,0,30),   -- Hace 2 días
(7,DATE_SUB(CURDATE(), INTERVAL 1 DAY),55,5,50),   -- Ayer
(8,CURDATE(),60,10,50),                             -- Hoy
(9,CURDATE(),45,5,40),                              -- Hoy
(10,CURDATE(),90,15,75);                            -- Hoy

-- PRODUCTOS_BOLETA (productos comprados en boletas)
INSERT INTO PRODUCTOS_BOLETA (idBoleta, idProducto, cantidad, precioUnitario) VALUES
-- Boleta 1: Cancha Grande + Gaseosa 21oz
(1, 1, 1, 18.00),
(1, 4, 1, 10.00),
-- Boleta 2: Combo Pareja
(2, 5, 1, 30.00),
-- Boleta 3: Cancha Mediana + Gaseosa 12oz
(3, 2, 1, 12.00),
(3, 3, 1, 7.00),
-- Boleta 4: Combo Clásico + Chocolate
(4, 6, 1, 18.00),
(4, 11, 2, 5.00),
-- Boleta 5: Combo Plata + Vaso Coleccionable
(5, 7, 1, 24.00),
(5, 12, 1, 25.00),
-- Boleta 6: Cancha Mediana
(6, 2, 1, 12.00),
-- Boleta 7: Combo Oro
(7, 8, 1, 35.00),
-- Boleta 8: Combo Pareja
(8, 5, 1, 30.00),
-- Boleta 9: Cancha Grande + Extra Mantequilla
(9, 1, 1, 18.00),
(9, 13, 1, 3.00),
-- Boleta 10: Combo Black
(10, 9, 1, 49.00);

-- BOLETA_ASIENTO (asientos reservados por boleta)
INSERT INTO BOLETA_ASIENTO (idBoleta, idFuncion, idPlanoSala, precioUnitario) VALUES
-- Boleta 1: 2 asientos función 1
(1, 1, 1, 25.00),
(1, 1, 2, 25.00),
-- Boleta 2: 2 asientos función 2
(2, 2, 5, 20.00),
(2, 2, 6, 20.00),
-- Boleta 3: 1 asiento función 3
(3, 3, 9, 30.00),
-- Boleta 4: 2 asientos función 4
(4, 4, 13, 18.00),
(4, 4, 14, 18.00),
-- Boleta 5: 2 asientos función 5
(5, 5, 17, 28.00),
(5, 5, 18, 28.00),
-- Boleta 6: 1 asiento función 6
(6, 6, 21, 27.00),
-- Boleta 7: 2 asientos función 7
(7, 7, 25, 22.00),
(7, 7, 26, 22.00),
-- Boleta 8: 2 asientos función 8
(8, 8, 29, 20.00),
(8, 8, 30, 20.00),
-- Boleta 9: 1 asiento función 9
(9, 9, 33, 26.00),
-- Boleta 10: 3 asientos función 10
(10, 10, 37, 24.00),
(10, 10, 38, 24.00),
(10, 10, 39, 24.00);

-- PROMO_BOLETA (promociones aplicadas a boletas)
INSERT INTO PROMO_BOLETA (idBoleta, idPromo, montoDescuento, cantidad, detalle) VALUES
-- Boleta 1: General (sin descuento)
(1, 1, 0.00, 1, 'Entrada general'),
-- Boleta 2: Adulto Mayor 20%
(2, 2, 10.00, 1, 'Descuento adulto mayor'),
-- Boleta 3: General
(3, 1, 0.00, 1, 'Entrada general'),
-- Boleta 4: Niños 20%
(4, 3, 7.00, 1, 'Descuento niños'),
-- Boleta 5: Martes al 50%
(5, 5, 10.00, 1, 'Martes al 50%'),
-- Boleta 6: General
(6, 1, 0.00, 1, 'Entrada general'),
-- Boleta 7: Socio Cineplanet 45%
(7, 6, 5.00, 1, 'Descuento socio'),
-- Boleta 8: Universitario 35%
(8, 7, 10.00, 1, 'Descuento universitario'),
-- Boleta 9: CONADIS 40%
(9, 4, 5.00, 1, 'Descuento CONADIS'),
-- Boleta 10: Socio Cineplanet
(10, 6, 15.00, 2, 'Descuento socio múltiples entradas');

-- PROMO_USO (registro de uso de promociones por usuario - últimos 7 días)
INSERT INTO PROMO_USO (idUsuario, idPromo, cantidad, fechaUso) VALUES
-- Usuario 1 usó promo General
(1, 1, 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
-- Usuario 2 usó promo Adulto Mayor
(2, 2, 1, DATE_SUB(NOW(), INTERVAL 6 DAY)),
-- Usuario 3 usó promo General
(3, 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
-- Usuario 4 usó promo Niños
(4, 3, 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
-- Usuario 5 usó promo Martes 50%
(5, 5, 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- Usuario 6 usó promo General
(6, 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- Usuario 7 (socio) usó promo Socio
(7, 6, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- Usuario 8 (socio) usó promo Universitario
(8, 7, 1, NOW()),
-- Usuario 9 (socio) usó promo CONADIS
(9, 4, 1, NOW()),
-- Usuario 10 (socio) usó promo Socio múltiples veces
(10, 6, 2, NOW()),
-- Usuario 1 (socio oro) usó Preventa (stock limitado)
(1, 10, 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- Usuario 4 (socio black) usó Preventa
(4, 10, 1, DATE_SUB(NOW(), INTERVAL 2 DAY));

;