-- Script mínimo de inserción de datos de ejemplo para dbCinePlanet
-- Ejecutar después de DB/dbCinePlanet.sql

USE dbcineplanet;

-- Creación mínima de datos para demostrar procedimientos y reserva de asientos

-- 1) Idioma
CALL idioma_create('Español', @idioma_es);

-- 2) Ciudad y cine
CALL ciudad_create('Lima', @ciudad_lima);
CALL cine_create('Cine Prueba','Av. Ejemplo 123','999222333','prueba@cine.com', @ciudad_lima, @cine1);

-- 3) Sala
CALL sala_create('Sala 1', 50, '2D', @cine1, @sala1);

-- 4) Asientos (creamos unos pocos ejemplos: A1, A2 y A3 discapacidad)
CALL asiento_create(@sala1, 'A', 1, 'normal', @as1);
CALL asiento_create(@sala1, 'A', 2, 'normal', @as2);
CALL asiento_create(@sala1, 'A', 3, 'discapacidad', @as3);

-- 5) Formato y película
CALL formato_create('2D', @fmt2d);
CALL pelicula_create('Comedia', 95, '13+', 'Normal', 'Sinopsis breve de ejemplo', 'Director Ejemplo', NULL, NULL, 'activa', @pel1);
CALL pelicula_formato_add(@pel1, @fmt2d);
CALL pelicula_idioma_add(@pel1, @idioma_es);

-- 6) Función (asociada a la sala creada)
CALL funcion_create(@pel1, @sala1, @fmt2d, '2025-11-01', '18:00:00', 20.00, @idioma_es, 'activa', @func1);

-- 7) Usuario y socio (socio usa mismo id que usuario)
CALL usuario_create('Juan Test','juan.test@example.com','DNI','20000001', 1, @u1);
CALL socio_create(@u1, 'pass123', 'Lima', 'Lima', 'Miraflores', 'Perez', 'Lopez', 'Cine Prueba', '1990-05-10', '999888777', 'M', 'clasico');

-- 8) Boleta y reserva de asientos (usar los procedimientos)
CALL boleta_create(@u1, CURDATE(), @b1);

-- Reservar asientos A1 y A2 para la función (llama a boleta_asiento_add que valida pertenencia y disponibilidad)
CALL boleta_asiento_add(@b1, @func1, @as1, 20.00, @ba1);
CALL boleta_asiento_add(@b1, @func1, @as2, 20.00, @ba2);

-- Recalcular totales de la boleta
CALL recalc_boleta_total(@b1);

-- Resultados rápidos
-- Mostrar la boleta (usar calificador de tabla para evitar errores de sintaxis en algunas versiones de MariaDB)
SELECT 'BOLETA' AS tipo, b.* FROM BOLETA b WHERE b.id = @b1;
SELECT ba.id, ba.idBoleta, ba.idFuncion, ba.idAsiento, a.fila, a.numero, a.tipo, ba.precioUnitario
FROM BOLETA_ASIENTO ba JOIN ASIENTO a ON ba.idAsiento = a.id
WHERE ba.idBoleta = @b1
ORDER BY a.fila, a.numero;

-- Fin del script de ejemplo (sencillo, usa exclusivamente procedimientos definidos en el esquema)

