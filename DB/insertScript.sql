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
-- Crear idiomas usando el procedimiento
CALL idioma_create('Español', @idioma_es);
CALL idioma_create('Inglés', @idioma_en);
CALL idioma_create('Subtitulado', @idioma_sub);

-- 2) Usuarios
-- Crear usuarios usando el procedimiento usuario_create (valores únicos para evitar solapamientos)
CALL usuario_create('Juan Perez Test','juan.test@example.com','DNI','20000001', @u1);
CALL usuario_create('Ana Gomez Test','ana.test@example.com','DNI','20000002', @u2);

-- 2.1) Socio (ejemplo) — usa el id del usuario previamente creado (@u1)
-- Crear socio usando el procedimiento socio_create
CALL socio_create(@u1, 'pass123', 'Lima', 'Lima', 'Miraflores', 'Perez', 'Lopez', 'Cine Central', '1990-05-10', '999888777', 'M');

-- 3) Cine y sala
-- Crear cine y sala usando los procedimientos
CALL cine_create('Cine Prueba','Av Prueba 101','999222333','prueba@cine.com','Lima', @cine1);
CALL sala_create('Sala Prueba',120,'2D',@cine1, @sala1);

-- 4) Formatos
-- Crear formatos usando procedimiento
CALL formato_create('2D', @fmt2d);
CALL formato_create('3D', @fmt3d);

-- 5) Películas
-- Crear película usando procedimiento (valores de ejemplo distintos)
CALL pelicula_create('Comedia',95,'13+','Normal','Sinopsis de prueba','Director Demo',NULL,NULL,'activa', @pel1);

-- Asociar formato e idiomas a la película
-- Asociar formato e idioma. Para idioma usamos el procedimiento de normalización
INSERT IGNORE INTO PELICULA_FORMATO(idPelicula,idFormato) VALUES (@pel1,@fmt2d);
CALL pelicula_idioma_add(@pel1, @idioma_es);

-- 6) Funciones (cada función tiene un solo idioma)
-- Crear función usando procedimiento (fechas distintas para evitar solapamientos)
CALL funcion_create(@pel1, @sala1, @fmt2d, '2025-11-01', '18:00:00', 22.00, @idioma_es, 'activa', @func1);
CALL funcion_create(@pel1, @sala1, @fmt2d, '2025-11-01', '21:00:00', 28.00, @idioma_en, 'activa', @func2);

-- 7) Productos
-- Crear productos usando procedimiento
CALL producto_create('Palomitas Med Test','Palomitas medianas de prueba',11.00,NULL,'dulceria', @prod1);
CALL producto_create('Gaseosa L Test','Gaseosa grande de prueba',8.00,NULL,'dulceria', @prod2);

-- 8) Promociones
-- Promo 1: 10% en productos
-- Crear promociones usando procedimiento
CALL promo_create('PromoProd10 Test','10% en productos de prueba','2025-10-01','2025-12-31','porcentaje',10.00,'productos','activa', @promo_prod);
CALL promo_create('PromoFunc5 Test','S/5 descuento en entradas de prueba','2025-10-01','2025-12-31','fijo',5.00,'funciones','activa', @promo_func);
CALL promo_create('PromoTodo15 Test','15% en todo de prueba','2025-10-01','2025-12-31','porcentaje',15.00,'todo','activa', @promo_all);

-- ==========
-- BOLETA 1: función con descuento fijo (Solo función + promo función)
-- ==========
-- Crear boleta usando procedimiento y añadir líneas usando los helpers
CALL boleta_create(@u1,'2025-11-02', @b1);
-- obtener precio actual de la función creada
SELECT precio INTO @precio_func FROM FUNCION WHERE id = @func1;
CALL funcion_boleta_add(@b1, @func1, 2, @precio_func, @func_line1);
-- Aplicar promo de funciones
CALL promo_boleta_add(@b1, @promo_func, @promo_boleta_line1);
CALL recalc_boleta_total(@b1);

-- Mostrar resultado boleta 1
SELECT 'BOLETA1' AS which, b.* FROM BOLETA b WHERE id = @b1;

-- ==========
-- BOLETA 2: producto con descuento porcentaje (Solo productos + promo productos)
-- ==========
CALL boleta_create(@u1,'2025-11-03', @b2);
SELECT precio INTO @precio_prod1 FROM PRODUCTO WHERE id = @prod1;
CALL producto_boleta_add(@b2, @prod1, 3, @precio_prod1, @prod_line1);
CALL promo_boleta_add(@b2, @promo_prod, @promo_boleta_line2);
CALL recalc_boleta_total(@b2);

SELECT 'BOLETA2' AS which, b.* FROM BOLETA b WHERE id = @b2;

-- ==========
-- BOLETA 3: mixta (producto + función) con promos separadas
-- ==========
CALL boleta_create(@u2,'2025-11-04', @b3);
SELECT precio INTO @precio_prod1b FROM PRODUCTO WHERE id = @prod1;
CALL producto_boleta_add(@b3, @prod1, 1, @precio_prod1b, @prod_line2);
SELECT precio INTO @precio_func2 FROM FUNCION WHERE id = @func2;
CALL funcion_boleta_add(@b3, @func2, 1, @precio_func2, @func_line2);
CALL promo_boleta_add(@b3, @promo_prod, @promo_boleta_line3);
CALL promo_boleta_add(@b3, @promo_func, @promo_boleta_line4);
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

