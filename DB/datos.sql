USE dbcineplanet;

-- =================================
-- CIUDADES
-- =================================
INSERT INTO CIUDAD(nombre) VALUES
('Lima'),
('Arequipa'),
('Cusco');

-- =================================
-- CINES
-- =================================
INSERT INTO CINE(nombre,direccion,telefono,email,idCiudad) VALUES
('Cinepolis Lima', 'Av. La Marina 123', '987654321', 'lima@cinepolis.com', 1),
('CineStar Arequipa', 'Calle San Martin 456', '987654322', 'arequipa@cinestar.com', 2),
('Cine Max Cusco', 'Av. Sol 789', '987654323', 'cusco@cinemax.com', 3);

-- =================================
-- GENEROS
-- =================================
INSERT INTO GENERO(nombre) VALUES
('Acción'),
('Comedia'),
('Drama'),
('Terror'),
('Animación');

-- =================================
-- FORMATO
-- =================================
INSERT INTO FORMATO(nombre) VALUES
('2D'),
('3D'),
('IMAX');

-- =================================
-- IDIOMAS
-- =================================
INSERT INTO IDIOMA(nombre) VALUES
('Español'),
('Inglés'),
('Francés');

-- =================================
-- USUARIOS
-- =================================
INSERT INTO USUARIO(nombre,email,tipoDocumento,numeroDocumento) VALUES
('Juan Perez','juanp@example.com','DNI','12345678'),
('Maria Gomez','mariag@example.com','DNI','87654321');

-- =================================
-- SOCIOS
-- =================================
INSERT INTO SOCIO(id,password,departamento,provincia,distrito,apellidoPaterno,apellidoMaterno,cineplanetFavorito,fechaNacimiento,celular,genero,grado)
VALUES
(1,'pass123','Lima','Lima','Miraflores','Perez','Gonzales','Cinepolis Lima','1990-05-10','987111222','M','plata'),
(2,'pass456','Arequipa','Arequipa','Cayma','Gomez','Lopez','CineStar Arequipa','1992-08-22','987333444','F','oro');

-- =================================
-- PELICULAS
-- =================================
INSERT INTO PELICULA(idGenero,duracion,restriccionEdad,restriccionComercial,sinopsis,autor,trailer,portada,estado) VALUES
(1,120,'13+','General','Película de acción espectacular','Director A','https://trailer1.com','https://img1.com','activa'),
(2,90,'7+','General','Comedia familiar divertida','Director B','https://trailer2.com','https://img2.com','activa');

-- =================================
-- PELICULA_IDIOMA
-- =================================
INSERT INTO PELICULA_IDIOMA(idPelicula,idIdioma) VALUES
(1,1),
(1,2),
(2,1);

-- =================================
-- PELICULA_FORMATO
-- =================================
INSERT INTO PELICULA_FORMATO(idPelicula,idFormato) VALUES
(1,1),
(1,3),
(2,1);

-- =================================
-- SALAS
-- =================================
INSERT INTO SALA(nombre,capacidad,tipo,idCine) VALUES
('Sala 1',50,'Normal',1),
('Sala 2',70,'IMAX',1),
('Sala 1',60,'Normal',2);

-- =================================
-- ASIENTOS
-- =================================
INSERT INTO ASIENTO(idSala,fila,numero,tipo) VALUES
(1,'A',1,'normal'),
(1,'A',2,'normal'),
(1,'A',3,'discapacidad'),
(1,'B',1,'normal'),
(2,'A',1,'normal'),
(3,'A',1,'normal');

-- =================================
-- FUNCIONES
-- =================================
INSERT INTO FUNCION(idPelicula,idSala,idFormato,fecha,hora,precio,idIdioma,estado) VALUES
(1,1,1,'2025-10-28','18:00:00',25.00,1,'activa'),
(1,2,3,'2025-10-28','20:00:00',35.00,2,'activa'),
(2,3,1,'2025-10-28','19:00:00',20.00,1,'activa');

-- =================================
-- PRODUCTOS
-- =================================
INSERT INTO PRODUCTO(nombre,descripcion,precio,imagen,tipo) VALUES
('Palomitas','Palomitas grandes',10.00,'https://imgpopcorn.com','Comida'),
('Gaseosa','Refresco 500ml',5.00,'https://imgsoda.com','Bebida');

-- =================================
-- PROMOS
-- =================================
INSERT INTO PROMO(nombre,descripcion,fecha_inicio,fecha_fin,tipo,valor,aplicaA,estado) VALUES
('Promo Combo','10% descuento en combo','2025-10-28','2025-11-05','porcentaje',10,'todo','activa'),
('Promo Cine 2D','5 unidades de descuento en entradas 2D','2025-10-28','2025-11-05','fijo',5,'funciones','activa');
