-- -----------------------------------------------------
-- Usar la base de datos
-- -----------------------------------------------------
USE dbcineplanet;

-- Deshabilitar temporalmente la revisión de claves foráneas para cargar datos
SET FOREIGN_KEY_CHECKS=0;

-- -----------------------------------------------------
-- Grupo 1: Tablas sin dependencias
-- -----------------------------------------------------

-- -- CIUDAD (10 Ciudades Peruanas)
INSERT INTO `CIUDAD` (`id`, `nombre`) VALUES
(1, 'Lima'),
(2, 'Arequipa'),
(3, 'Trujillo'),
(4, 'Cusco'),
(5, 'Piura'),
(6, 'Chiclayo'),
(7, 'Huancayo'),
(8, 'Iquitos'),
(9, 'Tacna'),
(10, 'Pucallpa');

-- -- GENERO (10 Géneros de películas)
INSERT INTO `GENERO` (`id`, `nombre`) VALUES
(1, 'Acción'),
(2, 'Comedia'),
(3, 'Drama'),
(4, 'Ciencia Ficción'),
(5, 'Terror'),
(6, 'Fantasía'),
(7, 'Animación'),
(8, 'Suspenso'),
(9, 'Documental'),
(10, 'Romance');

-- -- RESTRICCION (Clasificaciones comunes)
INSERT INTO `RESTRICCION` (`id`, `tipo`) VALUES
(1, 'APT'),
(2, 'PG (Supervisión)'),
(3, '+14'),
(4, '+18');

-- -- FORMATO (5 Formatos de película)
INSERT INTO `FORMATO` (`id`, `nombre`) VALUES
(1, '2D'),
(2, '3D'),
(3, '4DX'),
(4, 'ScreenX'),
(5, 'Prime');

-- -- IDIOMA (5 Idiomas/subtítulos)
INSERT INTO `IDIOMA` (`id`, `nombre`) VALUES
(1, 'ESP'),
(2, 'SUB'),
(3, 'ESP (Doblada)'),
(4, 'ENG (Original)'),
(5, 'QUE (Quechua)');

-- -- PRODUCTO (10 Productos de dulcería)
INSERT INTO `PRODUCTO` (`id`, `nombre`, `descripcion`, `precio`, `imagen`, `tipo`) VALUES
(1, 'Popcorn Gigante Salado', 'Cancha salada en balde gigante', 25.50, 'popcorn_g_s.jpg', 'Popcorn'),
(2, 'Popcorn Gigante Dulce', 'Cancha dulce en balde gigante', 25.50, 'popcorn_g_d.jpg', 'Popcorn'),
(3, 'Gaseosa Mediana', 'Gaseosa de 22oz (Inca Kola/Coca Cola)', 12.00, 'gaseosa_m.jpg', 'Bebida'),
(4, 'Gaseosa Grande', 'Gaseosa de 32oz (Inca Kola/Coca Cola)', 15.00, 'gaseosa_g.jpg', 'Bebida'),
(5, 'Hot Dog Clásico', 'Hot Dog simple con papas al hilo', 10.00, 'hotdog_c.jpg', 'Snack'),
(6, 'Nachos con Queso', 'Nachos con salsa de queso cheddar', 18.00, 'nachos_q.jpg', 'Snack'),
(7, 'Combo Pareja', '1 Popcorn Gigante + 2 Gaseosas Medianas', 45.00, 'combo_p.jpg', 'Combo'),
(8, 'Combo Familiar', '2 Popcorn Gigantes + 4 Gaseosas Grandes', 80.00, 'combo_f.jpg', 'Combo'),
(9, 'Agua Mineral', 'Botella de agua sin gas 600ml', 6.00, 'agua.jpg', 'Bebida'),
(10, 'Chocolate Sublime', 'Tableta de chocolate Sublime', 5.00, 'sublime.jpg', 'Dulce');

-- -- PROMO (5 Promociones)
INSERT INTO `PROMO` (`id`, `nombre`, `descripcion`, `fecha_inicio`, `fecha_fin`, `tipo`, `valor`, `aplicaA`, `estado`) VALUES
(1, 'Martes 2x1', '2x1 en entradas 2D y 3D los martes', '2025-01-01', '2025-12-31', 'porcentaje', 50, 'funciones', 'activa'),
(2, 'Combo Verano', 'Ahorra S/ 5 en tu Combo Pareja', '2025-01-15', '2025-03-31', 'fijo', 5.00, 'productos', 'activa'),
(3, 'Estreno Jueves', '10% dscto. en estrenos (solo Jueves)', '2025-01-01', '2025-12-31', 'porcentaje', 10, 'funciones', 'activa'),
(4, 'Cyber Planet', '30% dscto. en todo comprando online', '2025-11-10', '2025-11-12', 'porcentaje', 30, 'todo', 'inactiva'),
(5, 'Socio Black', 'Upgrade a Popcorn Gigante gratis', '2025-01-01', '2025-12-31', 'fijo', 3.00, 'productos', 'activa');

-- -- USUARIO (10 Usuarios)
INSERT INTO `USUARIO` (`id`, `nombre`, `email`, `tipoDocumento`, `numeroDocumento`) VALUES
(1, 'Ana García Pérez', 'ana.garcia@email.com', 'DNI', '71234567'),
(2, 'Bruno Torres Ruiz', 'bruno.torres@email.com', 'DNI', '72345678'),
(3, 'Carla Mendoza Silva', 'carla.mendoza@email.com', 'CE', '01234567'),
(4, 'David Quispe Luna', 'david.quispe@email.com', 'DNI', '73456789'),
(5, 'Elena Vargas Solis', 'elena.vargas@email.com', 'DNI', '74567890'),
(6, 'Franco Castillo Díaz', 'franco.castillo@email.com', 'DNI', '75678901'),
(7, 'Gabriela Flores Cruz', 'gaby.flores@email.com', 'CE', '02345678'),
(8, 'Hugo Sánchez Romero', 'hugo.sanchez@email.com', 'DNI', '76789012'),
(9, 'Inés Chávez Costa', 'ines.chavez@email.com', 'DNI', '77890123'),
(10, 'Javier Paredes Rojas', 'javier.paredes@email.com', 'DNI', '78901234');

-- -----------------------------------------------------
-- Grupo 2: Dependen de Grupo 1
-- -----------------------------------------------------

-- -- CINE (10 Cines, dependen de CIUDAD)
INSERT INTO `CINE` (`id`, `nombre`, `direccion`, `telefono`, `email`, `idCiudad`) VALUES
(1, 'Cineplanet Alcázar', 'Av. Santa Cruz 814, Miraflores', '016104545', 'alcazar@cineplanet.com.pe', 1),
(2, 'Cineplanet San Miguel', 'Av. La Marina 2000, San Miguel', '016104545', 'sanmiguel@cineplanet.com.pe', 1),
(3, 'Cineplanet Mall Aventura Arequipa', 'Av. Porongoche 500, Paucarpata', '054605555', 'arequipa@cineplanet.com.pe', 2),
(4, 'Cineplanet Real Plaza Trujillo', 'Av. César Vallejo Oeste 1345', '044605555', 'trujillo@cineplanet.com.pe', 3),
(5, 'Cineplanet Real Plaza Cusco', 'Av. Collasuyo 2964', '084605555', 'cusco@cineplanet.com.pe', 4),
(6, 'Cineplanet Real Plaza Piura', 'Av. Sánchez Cerro 234', '073605555', 'piura@cineplanet.com.pe', 5),
(7, 'Cineplanet Real Plaza Chiclayo', 'Calle Miguel de Cervantes 300', '074605555', 'chiclayo@cineplanet.com.pe', 6),
(8, 'Cineplanet Real Plaza Huancayo', 'Av. Ferrocarril 1035', '064605555', 'huancayo@cineplanet.com.pe', 7),
(9, 'Cineplanet Mall Aventura Tacna', 'Av. Panamericana 1500', '052605555', 'tacna@cineplanet.com.pe', 9),
(10, 'Cineplanet Real Plaza Pucallpa', 'Av. Centenario Km 4.3', '061605555', 'pucallpa@cineplanet.com.pe', 10);

-- -- PELICULA (10 Películas, dependen de GENERO y RESTRICCION)
INSERT INTO `PELICULA` (`id`, `nombre`, `genero`, `duracion`, `restriccion`, `restriccionComercial`, `sinopsis`, `autor`, `trailer`, `portada`, `estado`) VALUES
(1, 'El Amanecer del Guardián', 1, 140, 3, 'Recomendada +14', 'Un héroe solitario debe salvar la ciudad...', 'Dir. Juan Pérez', 'trailer1.mp4', 'portada1.jpg', 'activa'),
(2, 'Risas en la Oficina', 2, 95, 1, 'Para todos', 'Las locuras de un grupo de oficinistas.', 'Dir. Ana López', 'trailer2.mp4', 'portada2.jpg', 'activa'),
(3, 'El Último Viaje', 3, 120, 2, 'PG', 'Un drama familiar sobre la reconciliación.', 'Dir. Carlos Solano', 'trailer3.mp4', 'portada3.jpg', 'activa'),
(4, 'Crónicas de Marte', 4, 150, 3, 'Recomendada +14', 'Exploradores descubren vida en Marte.', 'Dir. Lucía Torres', 'trailer4.mp4', 'portada4.jpg', 'activa'),
(5, 'La Casa del Eco', 5, 100, 4, 'Solo +18', 'Una familia es atormentada por ecos del pasado.', 'Dir. Miguel Ruiz', 'trailer5.mp4', 'portada5.jpg', 'activa'),
(6, 'El Reino de las Nubes', 6, 110, 1, 'Para todos', 'Una princesa busca el reino perdido.', 'Dir. Sofia Chan', 'trailer6.mp4', 'portada6.jpg', 'activa'),
(7, 'Misión: Rescate de Mascotas', 7, 90, 1, 'Para todos', 'Un grupo de animales parlanchines...', 'Dir. David Kim', 'trailer7.mp4', 'portada7.jpg', 'activa'),
(8, 'Código Sombra', 8, 130, 3, 'Recomendada +14', 'Un espía debe detener un complot global.', 'Dir. Elena Frost', 'trailer8.mp4', 'portada8.jpg', 'activa'),
(9, 'El Corazón del Amazonas', 9, 85, 1, 'Educativa', 'Documental sobre la vida en el Amazonas.', 'Dir. Pedro Morales', 'trailer9.mp4', 'portada9.jpg', 'activa'),
(10, 'Amor bajo la Lluvia', 10, 105, 2, 'PG', 'Dos extraños se enamoran en un día lluvioso.', 'Dir. Gabriela Ríos', 'trailer10.mp4', 'portada10.jpg', 'activa');

-- -- SOCIO (10 Socios, dependen de USUARIO)
INSERT INTO `SOCIO` (`id`, `password`, `departamento`, `provincia`, `distrito`, `apellidoPaterno`, `apellidoMaterno`, `cineplanetFavorito`, `fechaNacimiento`, `celular`, `genero`, `grado`) VALUES
(1, 'hash_pass_123', 'Lima', 'Lima', 'Miraflores', 'García', 'Pérez', 'Alcázar', '1990-05-15', '987654321', 'Femenino', 'oro'),
(2, 'hash_pass_456', 'Lima', 'Lima', 'San Miguel', 'Torres', 'Ruiz', 'San Miguel', '1985-11-20', '987654322', 'Masculino', 'plata'),
(3, 'hash_pass_789', 'Lima', 'Lima', 'Surco', 'Mendoza', 'Silva', 'Alcázar', '1995-02-10', '987654323', 'Femenino', 'clasico'),
(4, 'hash_pass_101', 'Arequipa', 'Arequipa', 'Paucarpata', 'Quispe', 'Luna', 'Mall Aventura Arequipa', '1992-08-30', '987654324', 'Masculino', 'black'),
(5, 'hash_pass_112', 'La Libertad', 'Trujillo', 'Trujillo', 'Vargas', 'Solis', 'Real Plaza Trujillo', '1998-12-01', '987654325', 'Femenino', 'clasico'),
(6, 'hash_pass_131', 'Piura', 'Piura', 'Piura', 'Castillo', 'Díaz', 'Real Plaza Piura', '2000-03-25', '987654326', 'Masculino', 'plata'),
(7, 'hash_pass_141', 'Lima', 'Lima', 'La Molina', 'Flores', 'Cruz', 'San Miguel', '1993-07-07', '987654327', 'Femenino', 'oro'),
(8, 'hash_pass_151', 'Cusco', 'Cusco', 'Cusco', 'Sánchez', 'Romero', 'Real Plaza Cusco', '1988-01-18', '987654328', 'Masculino', 'clasico'),
(9, 'hash_pass_161', 'Tacna', 'Tacna', 'Tacna', 'Chávez', 'Costa', 'Mall Aventura Tacna', '1991-06-12', '987654329', 'Femenino', 'black'),
(10, 'hash_pass_171', 'Lima', 'Lima', 'Pueblo Libre', 'Paredes', 'Rojas', 'San Miguel', '1997-09-05', '987654330', 'Masculino', 'plata');

-- -----------------------------------------------------
-- Grupo 3: Dependen de Grupo 2
-- -----------------------------------------------------

-- -- SALA (10 Salas, dependen de CINE)
INSERT INTO `SALA` (`id`, `nombre`, `capacidad`, `tipo`, `idCine`) VALUES
(1, 'Sala 1', 150, 'Regular', 1),
(2, 'Sala 2', 150, 'Regular', 1),
(3, 'Sala 3 (4DX)', 80, '4DX', 1),
(4, 'Sala 1', 200, 'Regular', 2),
(5, 'Sala 2', 200, 'Regular', 2),
(6, 'Sala Prime 1', 60, 'Prime', 2),
(7, 'Sala 1', 180, 'Regular', 3),
(8, 'Sala 2', 180, 'Regular', 3),
(9, 'Sala 1', 160, 'Regular', 4),
(10, 'Sala 1 (ScreenX)', 100, 'ScreenX', 5);

-- -- PELICULA_FORMATO (10 links, dependen de PELICULA y FORMATO)
INSERT INTO `PELICULA_FORMATO` (`idPelicula`, `idFormato`) VALUES
(1, 1), (1, 2), (1, 3), -- Película 1 en 2D, 3D y 4DX
(2, 1), -- Película 2 solo en 2D
(3, 1), -- Película 3 solo en 2D
(4, 1), (4, 2), -- Película 4 en 2D y 3D
(5, 1), -- Película 5 solo en 2D
(7, 1), (7, 2), -- Película 7 en 2D y 3D
(8, 1), (8, 4), -- Película 8 en 2D y ScreenX
(10, 1), (10, 5); -- Película 10 en 2D y Prime

-- -- PELICULA_IDIOMA (10 links, dependen de PELICULA y IDIOMA)
INSERT INTO `PELICULA_IDIOMA` (`idPelicula`, `idIdioma`) VALUES
(1, 1), (1, 2), -- Película 1 en ESP y SUB
(2, 3), -- Película 2 Doblada
(3, 1), (3, 2), -- Película 3 en ESP y SUB
(4, 2), (4, 4), -- Película 4 en SUB y ENG
(5, 2), -- Película 5 en SUB
(6, 3), -- Película 6 Doblada
(7, 3), -- Película 7 Doblada
(8, 2), (8, 4), -- Película 8 en SUB y ENG
(9, 1), (9, 5), -- Película 9 en ESP y Quechua
(10, 3); -- Película 10 Doblada

-- -----------------------------------------------------
-- Grupo 4: Dependen de Grupo 3
-- -----------------------------------------------------

-- -- ASIENTO (10 Asientos para Sala 1, dependen de SALA)
-- (En un caso real, aquí irían cientos de asientos por sala)
INSERT INTO `ASIENTO` (`id`, `idSala`, `fila`, `numero`, `tipo`) VALUES
(1, 1, 'A', 1, 'normal'),
(2, 1, 'A', 2, 'normal'),
(3, 1, 'A', 3, 'normal'),
(4, 1, 'A', 4, 'normal'),
(5, 1, 'A', 5, 'discapacidad'),
(6, 1, 'B', 1, 'normal'),
(7, 1, 'B', 2, 'normal'),
(8, 1, 'B', 3, 'normal'),
(9, 1, 'B', 4, 'normal'),
(10, 1, 'B', 5, 'normal');

-- -- FUNCION (10 Funciones, dependen de PELICULA, SALA, FORMATO, IDIOMA)
-- (Usaremos Sala 1 (id=1) para las primeras funciones, para poder usar los asientos creados)
INSERT INTO `FUNCION` (`id`, `idPelicula`, `idSala`, `idFormato`, `fecha`, `hora`, `precio`, `idIdioma`, `estado`) VALUES
(1, 1, 1, 3, CURDATE(), '15:00:00', 45.00, 1, 'activa'), -- Pel 1, Sala 1 (4DX), Hoy 3pm, ESP
(2, 1, 1, 3, CURDATE(), '18:00:00', 45.00, 2, 'activa'), -- Pel 1, Sala 1 (4DX), Hoy 6pm, SUB
(3, 7, 1, 1, CURDATE(), '13:00:00', 20.00, 3, 'activa'), -- Pel 7, Sala 1 (2D), Hoy 1pm, DOBLADA
(4, 4, 2, 2, CURDATE(), '16:00:00', 30.00, 2, 'activa'), -- Pel 4, Sala 2 (3D), Hoy 4pm, SUB
(5, 8, 10, 4, CURDATE(), '20:00:00', 50.00, 4, 'activa'), -- Pel 8, Sala 10 (ScreenX), Hoy 8pm, ENG
(6, 10, 6, 5, CURDATE(), '21:00:00', 55.00, 3, 'activa'), -- Pel 10, Sala 6 (Prime), Hoy 9pm, DOBLADA
(7, 5, 4, 1, CURDATE()+1, '22:00:00', 22.00, 2, 'activa'), -- Pel 5, Sala 4 (2D), Mañana 10pm, SUB
(8, 2, 5, 1, CURDATE()+1, '19:00:00', 22.00, 3, 'activa'), -- Pel 2, Sala 5 (2D), Mañana 7pm, DOBLADA
(9, 1, 1, 3, CURDATE()+1, '15:00:00', 45.00, 1, 'activa'), -- Pel 1, Sala 1 (4DX), Mañana 3pm, ESP
(10, 3, 7, 1, CURDATE(), '17:00:00', 18.00, 1, 'activa'); -- Pel 3, Sala 7 (2D), Hoy 5pm, ESP

-- -----------------------------------------------------
-- Grupo 5: Transacciones (Dependen de USUARIO, FUNCION, PRODUCTO, PROMO)
-- -----------------------------------------------------

-- -- BOLETA (10 Boletas, dependen de USUARIO)
-- (Los totales se calcularán automáticamente por los triggers al insertar en las tablas de detalle)
INSERT INTO `BOLETA` (`id`, `idUsuario`, `fecha`) VALUES
(1, 1, CURDATE()), -- Ana Garcia
(2, 2, CURDATE()), -- Bruno Torres
(3, 3, CURDATE()), -- Carla Mendoza
(4, 4, CURDATE()), -- David Quispe
(5, 5, CURDATE()), -- Elena Vargas
(6, 6, CURDATE()), -- Franco Castillo
(7, 7, CURDATE()), -- Gabriela Flores
(8, 8, CURDATE()), -- Hugo Sánchez
(9, 9, CURDATE()), -- Inés Chávez
(10, 10, CURDATE()); -- Javier Paredes

-- -- FUNCIONES_BOLETA (Detalle de funciones por boleta)
-- (Esto registrará el item 'Entrada' en la boleta)
INSERT INTO `FUNCIONES_BOLETA` (`idBoleta`, `idFuncion`, `cantidad`, `precioUnitario`) VALUES
(1, 1, 2, 45.00), -- Boleta 1, 2 entradas para Función 1 (Precio 45 c/u)
(2, 3, 1, 20.00), -- Boleta 2, 1 entrada para Función 3 (Precio 20)
(3, 2, 4, 45.00), -- Boleta 3, 4 entradas para Función 2 (Precio 45 c/u)
(4, 6, 2, 55.00), -- Boleta 4, 2 entradas para Función 6 (Precio 55 c/u)
(5, 5, 1, 50.00), -- Boleta 5, 1 entrada para Función 5 (Precio 50)
(7, 10, 2, 18.00); -- Boleta 7, 2 entradas para Función 10 (Precio 18 c/u)

-- -- BOLETA_ASIENTO (Asientos específicos vendidos. Depende de BOLETA, FUNCION, ASIENTO)
-- (Debe coincidir con FUNCIONES_BOLETA. Todos estos son en Sala 1 (id=1))
INSERT INTO `BOLETA_ASIENTO` (`idBoleta`, `idFuncion`, `idAsiento`, `precioUnitario`) VALUES
(1, 1, 1, 45.00), -- Boleta 1, Funcion 1, Asiento A1 (ID 1)
(1, 1, 2, 45.00), -- Boleta 1, Funcion 1, Asiento A2 (ID 2)
(2, 3, 6, 20.00), -- Boleta 2, Funcion 3, Asiento B1 (ID 6)
(3, 2, 7, 45.00), -- Boleta 3, Funcion 2, Asiento B2 (ID 7)
(3, 2, 8, 45.00), -- Boleta 3, Funcion 2, Asiento B3 (ID 8)
(3, 2, 9, 45.00), -- Boleta 3, Funcion 2, Asiento B4 (ID 9)
(3, 2, 10, 45.00); -- Boleta 3, Funcion 2, Asiento B5 (ID 10)

-- -- PRODUCTOS_BOLETA (Detalle de productos por boleta)
INSERT INTO `PRODUCTOS_BOLETA` (`idBoleta`, `idProducto`, `cantidad`, `precioUnitario`) VALUES
(1, 7, 1, 45.00), -- Boleta 1 (Ana) compró 1 Combo Pareja
(2, 1, 1, 25.50), -- Boleta 2 (Bruno) compró 1 Popcorn Gigante Salado
(2, 3, 1, 12.00), -- Boleta 2 (Bruno) también compró 1 Gaseosa Mediana
(4, 8, 1, 80.00), -- Boleta 4 (David) compró 1 Combo Familiar
(6, 3, 2, 12.00), -- Boleta 6 (Franco) compró 2 Gaseosas Medianas (solo dulcería)
(8, 10, 5, 5.00), -- Boleta 8 (Hugo) compró 5 Chocolates (solo dulcería)
(10, 6, 1, 18.00); -- Boleta 10 (Javier) compró 1 Nachos (solo dulcería)

-- -- PROMO_BOLETA (Promociones aplicadas a boletas)
INSERT INTO `PROMO_BOLETA` (`idBoleta`, `idPromo`, `montoDescuento`, `detalle`) VALUES
(1, 1, 0, 'Martes 2x1'), -- Boleta 1 (Ana) usó Martes 2x1. El SP calculará el monto.
(4, 5, 0, 'Socio Black'), -- Boleta 4 (David, Socio Black) usó promo Socio.
(6, 2, 0, 'Combo Verano'); -- Boleta 6 (Franco) no compró combo pareja, pero aplicamos promo (el SP debería ignorarla si no aplica)


-- Reactivar la revisión de claves foráneas
SET FOREIGN_KEY_CHECKS=1;