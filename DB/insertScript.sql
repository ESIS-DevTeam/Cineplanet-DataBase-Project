-- Script de inserción de datos de prueba para dbCinePlanet
-- Ejecutar después de DB/dbCinePlanet.sql

-- Seleccionar la base de datos
USE dbcineplanet;

-- Desactivar temporalmente modo seguro si está activo
SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- Limpiar tablas (solo en entornos de prueba)
DELETE FROM PROMO_BOLETA; DELETE FROM PRODUCTOS_BOLETA; DELETE FROM FUNCIONES_BOLETA; DELETE FROM BOLETA;
DELETE FROM PROMO; DELETE FROM PRODUCTO; DELETE FROM FUNCION; DELETE FROM PELICULA_IDIOMA; DELETE FROM PELICULA_FORMATO; DELETE FROM PELICULA; DELETE FROM FORMATO; DELETE FROM SALA; DELETE FROM CINE; DELETE FROM IDIOMA; DELETE FROM SOCIO; DELETE FROM USUARIO;

-- 1) Idiomas
INSERT INTO IDIOMA(nombre) VALUES ('Español'); SET @idioma_es = LAST_INSERT_ID();
INSERT INTO IDIOMA(nombre) VALUES ('Inglés'); INSERT INTO IDIOMA(nombre) VALUES ('Subtitulado');

-- 2) Usuarios
INSERT INTO USUARIO(nombre,email,tipoDocumento,numeroDocumento) VALUES ('Juan Perez','juan@example.com','DNI','12345678'); SET @u1 = LAST_INSERT_ID();
INSERT INTO USUARIO(nombre,email,tipoDocumento,numeroDocumento) VALUES ('Ana Gomez','ana@example.com','DNI','87654321'); SET @u2 = LAST_INSERT_ID();

-- 2.1) Socio (ejemplo) — usa el id del usuario previamente creado (@u1)
INSERT INTO SOCIO(id,password,departamento,provincia,distrito,apellidoPaterno,apellidoMaterno,cineplanetFavorito,fechaNacimiento,celular,genero)
VALUES (@u1,'pass123','Lima','Lima','Miraflores','Perez','Lopez','Cine Central','1990-05-10','999888777','M');

-- 3) Cine y sala
INSERT INTO CINE(nombre,direccion,telefono,email,ciudad) VALUES ('Cine Central','Av Central 100','999111222','central@cine.com','Lima'); SET @cine1 = LAST_INSERT_ID();
INSERT INTO SALA(nombre,capacidad,tipo,idCine) VALUES ('Sala A',150,'2D',@cine1); SET @sala1 = LAST_INSERT_ID();

-- 4) Formatos
INSERT INTO FORMATO(nombre) VALUES ('2D'); SET @fmt2d = LAST_INSERT_ID();
INSERT INTO FORMATO(nombre) VALUES ('3D');

-- 5) Películas
INSERT INTO PELICULA(genero,duracion,restriccionEdad,restriccionComercial,sinopsis,autor,trailer,portada,estado)
VALUES ('Drama',110,'13+','Normal','Sinopsis ejemplo','Director X',NULL,NULL,'activa'); SET @pel1 = LAST_INSERT_ID();

-- Asociar formato e idiomas a la película
INSERT INTO PELICULA_FORMATO(idPelicula,idFormato) VALUES (@pel1,@fmt2d);
INSERT INTO PELICULA_IDIOMA(idPelicula,idIdioma) VALUES (@pel1,@idioma_es);

-- 6) Funciones (cada función tiene un solo idioma)
-- Función 1: precio 20.00 en Español
INSERT INTO FUNCION(idPelicula,idSala,idFormato,fecha,hora,precio,idIdioma,estado) VALUES (@pel1,@sala1,@fmt2d,'2025-10-20','18:00:00',20.00,@idioma_es,'activa'); SET @func1 = LAST_INSERT_ID();
-- Función 2: precio 25.00 en Inglés
INSERT INTO FUNCION(idPelicula,idSala,idFormato,fecha,hora,precio,idIdioma,estado) VALUES (@pel1,@sala1,@fmt2d,'2025-10-20','21:00:00',25.00,(@idioma_es+1),'activa'); SET @func2 = LAST_INSERT_ID();

-- 7) Productos
INSERT INTO PRODUCTO(nombre,descripcion,precio,imagen,tipo) VALUES ('Palomitas Med','Palomitas medianas',10.00,NULL,'dulceria'); SET @prod1 = LAST_INSERT_ID();
INSERT INTO PRODUCTO(nombre,descripcion,precio,imagen,tipo) VALUES ('Gaseosa L','Gaseosa grande',7.00,NULL,'dulceria'); SET @prod2 = LAST_INSERT_ID();

-- 8) Promociones
-- Promo 1: 10% en productos
INSERT INTO PROMO(nombre,descripcion,fecha_inicio,fecha_fin,tipo,valor,aplicaA,estado)
VALUES ('PromoProd10','10% en productos','2025-10-01','2025-12-31','porcentaje',10.00,'productos','activa'); SET @promo_prod = LAST_INSERT_ID();
-- Promo 2: S/5 fijo en funciones
INSERT INTO PROMO(nombre,descripcion,fecha_inicio,fecha_fin,tipo,valor,aplicaA,estado)
VALUES ('PromoFunc5','S/5 descuento en entradas','2025-10-01','2025-12-31','fijo',5.00,'funciones','activa'); SET @promo_func = LAST_INSERT_ID();
-- Promo 3: 15% en todo
INSERT INTO PROMO(nombre,descripcion,fecha_inicio,fecha_fin,tipo,valor,aplicaA,estado)
VALUES ('PromoTodo15','15% en todo','2025-10-01','2025-12-31','porcentaje',15.00,'todo','activa'); SET @promo_all = LAST_INSERT_ID();

-- ==========
-- BOLETA 1: función con descuento fijo (Solo función + promo función)
-- ==========
INSERT INTO BOLETA(idUsuario,fecha) VALUES (@u1,'2025-10-14'); SET @b1 = LAST_INSERT_ID();
-- Añadir 2 entradas de la función id=@func1 (precio 20.00)
INSERT INTO FUNCIONES_BOLETA(idBoleta,idFuncion,cantidad,precioUnitario) VALUES (@b1,@func1,2,20.00);
-- Aplicar promo de funciones (PromoFunc5)
INSERT INTO PROMO_BOLETA(idBoleta,idPromo) VALUES (@b1,@promo_func);
-- Forzar recálculo
CALL recalc_boleta_total(@b1);

-- Mostrar resultado boleta 1
SELECT 'BOLETA1' AS which, b.* FROM BOLETA b WHERE id = @b1;

-- ==========
-- BOLETA 2: producto con descuento porcentaje (Solo productos + promo productos)
-- ==========
INSERT INTO BOLETA(idUsuario,fecha) VALUES (@u1,'2025-10-14'); SET @b2 = LAST_INSERT_ID();
-- Añadir 3 palomitas
INSERT INTO PRODUCTOS_BOLETA(idBoleta,idProducto,cantidad,precioUnitario) VALUES (@b2,@prod1,3,10.00);
-- Aplicar promo de productos (PromoProd10)
INSERT INTO PROMO_BOLETA(idBoleta,idPromo) VALUES (@b2,@promo_prod);
CALL recalc_boleta_total(@b2);

SELECT 'BOLETA2' AS which, b.* FROM BOLETA b WHERE id = @b2;

-- ==========
-- BOLETA 3: mixta (producto + función) con promos separadas
-- ==========
INSERT INTO BOLETA(idUsuario,fecha) VALUES (@u2,'2025-10-14'); SET @b3 = LAST_INSERT_ID();
-- Producto: 1 palomitas
INSERT INTO PRODUCTOS_BOLETA(idBoleta,idProducto,cantidad,precioUnitario) VALUES (@b3,@prod1,1,10.00);
-- Función: 1 entrada función id=@func2 (precio 25.00)
INSERT INTO FUNCIONES_BOLETA(idBoleta,idFuncion,cantidad,precioUnitario) VALUES (@b3,@func2,1,25.00);
-- Aplicar promos productos y funciones a la boleta
INSERT INTO PROMO_BOLETA(idBoleta,idPromo) VALUES (@b3,@promo_prod);
INSERT INTO PROMO_BOLETA(idBoleta,idPromo) VALUES (@b3,@promo_func);
CALL recalc_boleta_total(@b3);

SELECT 'BOLETA3' AS which, b.* FROM BOLETA b WHERE id = @b3;

-- Resumen final: mostrar boletas y líneas
SELECT * FROM BOLETA ORDER BY id;
SELECT * FROM PRODUCTOS_BOLETA ORDER BY id;
SELECT * FROM FUNCIONES_BOLETA ORDER BY id;
SELECT pb.*, p.nombre, p.tipo, p.valor, p.aplicaA FROM PROMO_BOLETA pb JOIN PROMO p ON pb.idPromo = p.id ORDER BY pb.id;

-- Restaurar sql_safe_updates
SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

-- Fin del script

-- ==========================
-- Verificación: mostrar todas las tablas
-- ==========================
SELECT 'IDIOMA' AS tabla, i.* FROM IDIOMA i;
SELECT 'USUARIO' AS tabla, u.* FROM USUARIO u;
SELECT 'SOCIO' AS tabla, s.* FROM SOCIO s;
SELECT 'CINE' AS tabla, c.* FROM CINE c;
SELECT 'SALA' AS tabla, sa.* FROM SALA sa;
SELECT 'FORMATO' AS tabla, f.* FROM FORMATO f;
SELECT 'PELICULA' AS tabla, p.* FROM PELICULA p;
SELECT 'PELICULA_FORMATO' AS tabla, pf.* FROM PELICULA_FORMATO pf;
SELECT 'PELICULA_IDIOMA' AS tabla, pi.* FROM PELICULA_IDIOMA pi;
SELECT 'FUNCION' AS tabla, fn.* FROM FUNCION fn;
SELECT 'PRODUCTO' AS tabla, pr.* FROM PRODUCTO pr;
SELECT 'PROMO' AS tabla, pm.* FROM PROMO pm;
SELECT 'BOLETA' AS tabla, b.* FROM BOLETA b;
SELECT 'PRODUCTOS_BOLETA' AS tabla, pb.* FROM PRODUCTOS_BOLETA pb;
SELECT 'FUNCIONES_BOLETA' AS tabla, fb.* FROM FUNCIONES_BOLETA fb;
SELECT 'PROMO_BOLETA' AS tabla, pbb.*, p.nombre AS promo_nombre, p.tipo AS promo_tipo, p.valor AS promo_valor, p.aplicaA AS promo_aplicaA FROM PROMO_BOLETA pbb LEFT JOIN PROMO p ON pbb.idPromo = p.id;

