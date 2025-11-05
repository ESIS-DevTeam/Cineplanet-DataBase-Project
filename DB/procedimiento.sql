DELIMITER $$
DROP PROCEDURE IF EXISTS recalc_boleta_total$$
CREATE PROCEDURE recalc_boleta_total(IN p_idBoleta INT)
BEGIN
    DECLARE v_prod_sub DECIMAL(14,2) DEFAULT 0;
    DECLARE v_func_sub DECIMAL(14,2) DEFAULT 0;
    DECLARE v_subtotal DECIMAL(14,2) DEFAULT 0;
    DECLARE v_desc_total DECIMAL(14,2) DEFAULT 0;
    DECLARE v_got_lock INT DEFAULT 0;

    -- Intentar obtener lock por boleta (timeout 5s)
    SET v_got_lock = GET_LOCK(CONCAT('recalc_lock_', p_idBoleta), 5);

    IF v_got_lock = 1 THEN
        -- Calcular subtotales
        SELECT IFNULL(SUM(cantidad * precioUnitario),0) INTO v_prod_sub FROM PRODUCTOS_BOLETA WHERE idBoleta = p_idBoleta;
        SELECT IFNULL(SUM(cantidad * precioUnitario),0) INTO v_func_sub FROM FUNCIONES_BOLETA WHERE idBoleta = p_idBoleta;
        SET v_subtotal = v_prod_sub + v_func_sub;

        -- Calcular descuento total sin modificar PROMO_BOLETA (evita error 1442)
        SELECT IFNULL(SUM(
            CASE p.tipo
                WHEN 'porcentaje' THEN
                    CASE p.aplicaA
                        WHEN 'productos' THEN (v_prod_sub * p.valor / 100)
                        WHEN 'funciones' THEN (v_func_sub * p.valor / 100)
                        ELSE (v_subtotal * p.valor / 100)
                    END
                WHEN 'fijo' THEN p.valor
                ELSE 0
            END
        ), 0) INTO v_desc_total
        FROM PROMO_BOLETA pb
        JOIN PROMO p ON pb.idPromo = p.id
        WHERE pb.idBoleta = p_idBoleta
          AND p.estado = 'activa';

        IF v_desc_total > v_subtotal THEN
            SET v_desc_total = v_subtotal;
        END IF;

        -- Actualizar solo BOLETA (subtotal/desc/total)
        UPDATE BOLETA
        SET subtotal = ROUND(v_subtotal,2),
            descuentoTotal = ROUND(v_desc_total,2),
            total = ROUND(GREATEST(0, v_subtotal - v_desc_total),2)
        WHERE id = p_idBoleta;

        -- Liberar lock
        DO RELEASE_LOCK(CONCAT('recalc_lock_', p_idBoleta));
    END IF;
END$$
DELIMITER ;

-- ==================================================================
-- Procedimientos CRUD y helpers para operaciones comunes
-- ==================================================================

DELIMITER $$

-- USUARIO
DROP PROCEDURE IF EXISTS usuario_create$$
CREATE PROCEDURE usuario_create(
    IN p_nombre VARCHAR(100), IN p_email VARCHAR(100), IN p_tipoDocumento VARCHAR(20), IN p_numeroDocumento VARCHAR(20), IN p_tipoSocio INT, OUT p_id INT)
BEGIN
    INSERT INTO USUARIO(nombre,email,tipoDocumento,numeroDocumento,tipoSocio) VALUES (p_nombre,p_email,p_tipoDocumento,p_numeroDocumento,p_tipoSocio);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS usuario_get$$
CREATE PROCEDURE usuario_get(IN p_id INT)
BEGIN
    SELECT * FROM USUARIO WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS usuario_update$$
CREATE PROCEDURE usuario_update(IN p_id INT, IN p_nombre VARCHAR(100), IN p_email VARCHAR(100), IN p_tipoDocumento VARCHAR(20), IN p_numeroDocumento VARCHAR(20), IN p_tipoSocio INT)
BEGIN
    UPDATE USUARIO SET nombre = p_nombre, email = p_email, tipoDocumento = p_tipoDocumento, numeroDocumento = p_numeroDocumento, tipoSocio = p_tipoSocio WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS usuario_delete$$
CREATE PROCEDURE usuario_delete(IN p_id INT)
BEGIN
    DELETE FROM USUARIO WHERE id = p_id;
END$$

-- CINE
DROP PROCEDURE IF EXISTS cine_create$$
CREATE PROCEDURE cine_create(IN p_nombre VARCHAR(100), IN p_direccion VARCHAR(255), IN p_telefono VARCHAR(20), IN p_email VARCHAR(100), IN p_idCiudad INT, OUT p_id INT)
BEGIN
    INSERT INTO CINE(nombre,direccion,telefono,email,idCiudad) VALUES (p_nombre,p_direccion,p_telefono,p_email,p_idCiudad);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS cine_get$$
CREATE PROCEDURE cine_get(IN p_id INT)
BEGIN
    SELECT * FROM CINE WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS cine_update$$
CREATE PROCEDURE cine_update(IN p_id INT, IN p_nombre VARCHAR(100), IN p_direccion VARCHAR(255), IN p_telefono VARCHAR(20), IN p_email VARCHAR(100), IN p_idCiudad INT)
BEGIN
    UPDATE CINE SET nombre=p_nombre, direccion=p_direccion, telefono=p_telefono, email=p_email, idCiudad=p_idCiudad WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS cine_delete$$
CREATE PROCEDURE cine_delete(IN p_id INT)
BEGIN
    DELETE FROM CINE WHERE id = p_id;
END$$

-- IDIOMA
DROP PROCEDURE IF EXISTS idioma_create$$
CREATE PROCEDURE idioma_create(IN p_nombre VARCHAR(50), OUT p_id INT)
BEGIN
    INSERT INTO IDIOMA(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS idioma_get_all$$
CREATE PROCEDURE idioma_get_all()
BEGIN
    SELECT * FROM IDIOMA;
END$$

-- CIUDAD
DROP PROCEDURE IF EXISTS ciudad_create$$
CREATE PROCEDURE ciudad_create(IN p_nombre VARCHAR(100), OUT p_id INT)
BEGIN
    INSERT INTO CIUDAD(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS ciudad_get_all$$
CREATE PROCEDURE ciudad_get_all()
BEGIN
    SELECT * FROM CIUDAD;
END$$

DROP PROCEDURE IF EXISTS ciudad_get$$
CREATE PROCEDURE ciudad_get(IN p_id INT)
BEGIN
    SELECT * FROM CIUDAD WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS ciudad_update$$
CREATE PROCEDURE ciudad_update(IN p_id INT, IN p_nombre VARCHAR(100))
BEGIN
    UPDATE CIUDAD SET nombre = p_nombre WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS ciudad_delete$$
CREATE PROCEDURE ciudad_delete(IN p_id INT)
BEGIN
    DELETE FROM CIUDAD WHERE id = p_id;
END$$

-- SOCIO
DROP PROCEDURE IF EXISTS socio_create$$
CREATE PROCEDURE socio_create(
    IN p_idUsuario INT,
    IN p_password VARCHAR(255),
    IN p_departamento VARCHAR(50),
    IN p_provincia VARCHAR(50),
    IN p_distrito VARCHAR(50),
    IN p_apellidoPaterno VARCHAR(100),
    IN p_apellidoMaterno VARCHAR(100),
    IN p_cineplanetFavorito VARCHAR(50),
    IN p_fechaNacimiento DATE,
    IN p_celular VARCHAR(20),
    IN p_genero VARCHAR(10),
    IN p_grado ENUM('clasico','plata','oro','black')
)
BEGIN
    -- Asumimos que el usuario ya existe; el id del socio es el mismo que el id de usuario
    INSERT INTO SOCIO(id,password,departamento,provincia,distrito,apellidoPaterno,apellidoMaterno,cineplanetFavorito,fechaNacimiento,celular,genero,grado)
    VALUES (p_idUsuario,p_password,p_departamento,p_provincia,p_distrito,p_apellidoPaterno,p_apellidoMaterno,p_cineplanetFavorito,p_fechaNacimiento,p_celular,p_genero,p_grado);
END$$

DROP PROCEDURE IF EXISTS socio_get$$
CREATE PROCEDURE socio_get(IN p_id INT)
BEGIN
    SELECT * FROM SOCIO WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS socio_update$$
CREATE PROCEDURE socio_update(
    IN p_id INT,
    IN p_password VARCHAR(255),
    IN p_departamento VARCHAR(50),
    IN p_provincia VARCHAR(50),
    IN p_distrito VARCHAR(50),
    IN p_apellidoPaterno VARCHAR(100),
    IN p_apellidoMaterno VARCHAR(100),
    IN p_cineplanetFavorito VARCHAR(50),
    IN p_fechaNacimiento DATE,
    IN p_celular VARCHAR(20),
    IN p_genero VARCHAR(10),
    IN p_grado ENUM('clasico','plata','oro','black')
)
BEGIN
    UPDATE SOCIO SET password = p_password, departamento = p_departamento, provincia = p_provincia, distrito = p_distrito, apellidoPaterno = p_apellidoPaterno, apellidoMaterno = p_apellidoMaterno, cineplanetFavorito = p_cineplanetFavorito, fechaNacimiento = p_fechaNacimiento, celular = p_celular, genero = p_genero, grado = p_grado WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS socio_delete$$
CREATE PROCEDURE socio_delete(IN p_id INT)
BEGIN
    DELETE FROM SOCIO WHERE id = p_id;
END$$

-- PELICULA
DROP PROCEDURE IF EXISTS pelicula_create$$
CREATE PROCEDURE pelicula_create(
    IN p_nombre VARCHAR(100), IN p_genero INT, IN p_duracion INT, IN p_restriccion INT, IN p_restriccionComercial BOOLEAN, IN p_sinopsis TEXT, IN p_autor VARCHAR(100), IN p_trailer VARCHAR(255), IN p_portada VARCHAR(255), IN p_estado ENUM('activa','inactiva'), OUT p_id INT)
BEGIN
    INSERT INTO PELICULA(nombre,genero,duracion,restriccion,restriccionComercial,sinopsis,autor,trailer,portada,estado)
    VALUES (p_nombre,p_genero,p_duracion,p_restriccion,p_restriccionComercial,p_sinopsis,p_autor,p_trailer,p_portada,p_estado);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS pelicula_get$$
CREATE PROCEDURE pelicula_get(IN p_id INT)
BEGIN
    SELECT * FROM PELICULA WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS pelicula_get_active$$
CREATE PROCEDURE pelicula_get_active()
BEGIN
    SELECT * FROM PELICULA WHERE estado = 'activa';
END$$

DROP PROCEDURE IF EXISTS pelicula_update$$
CREATE PROCEDURE pelicula_update(
    IN p_id INT, IN p_nombre VARCHAR(100), IN p_genero INT, IN p_duracion INT, IN p_restriccion INT, IN p_restriccionComercial BOOLEAN, IN p_sinopsis TEXT, IN p_autor VARCHAR(100), IN p_trailer VARCHAR(255), IN p_portada VARCHAR(255), IN p_estado ENUM('activa','inactiva'))
BEGIN
    UPDATE PELICULA SET nombre=p_nombre, genero=p_genero, duracion=p_duracion, restriccion=p_restriccion, restriccionComercial=p_restriccionComercial, sinopsis=p_sinopsis, autor=p_autor, trailer=p_trailer, portada=p_portada, estado=p_estado WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS pelicula_delete$$
CREATE PROCEDURE pelicula_delete(IN p_id INT)
BEGIN
    DELETE FROM PELICULA WHERE id = p_id;
END$$

-- PELICULA_IDIOMA (asignar/quitar idioma a pelicula)
DROP PROCEDURE IF EXISTS pelicula_idioma_add$$
CREATE PROCEDURE pelicula_idioma_add(IN p_idPelicula INT, IN p_idIdioma INT)
BEGIN
    INSERT IGNORE INTO PELICULA_IDIOMA(idPelicula,idIdioma) VALUES (p_idPelicula,p_idIdioma);
END$$

DROP PROCEDURE IF EXISTS pelicula_idioma_remove$$
CREATE PROCEDURE pelicula_idioma_remove(IN p_idPelicula INT, IN p_idIdioma INT)
BEGIN
    DELETE FROM PELICULA_IDIOMA WHERE idPelicula = p_idPelicula AND idIdioma = p_idIdioma;
END$$

-- PELICULA_FORMATO (asignar/quitar formato a pelicula)
DROP PROCEDURE IF EXISTS pelicula_formato_add$$
CREATE PROCEDURE pelicula_formato_add(IN p_idPelicula INT, IN p_idFormato INT)
BEGIN
    INSERT IGNORE INTO PELICULA_FORMATO(idPelicula,idFormato) VALUES (p_idPelicula,p_idFormato);
END$$

DROP PROCEDURE IF EXISTS pelicula_formato_remove$$
CREATE PROCEDURE pelicula_formato_remove(IN p_idPelicula INT, IN p_idFormato INT)
BEGIN
    DELETE FROM PELICULA_FORMATO WHERE idPelicula = p_idPelicula AND idFormato = p_idFormato;
END$$



-- FORMATO
DROP PROCEDURE IF EXISTS formato_create$$
CREATE PROCEDURE formato_create(IN p_nombre VARCHAR(50), OUT p_id INT)
BEGIN
    INSERT INTO FORMATO(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS formato_get_all$$
CREATE PROCEDURE formato_get_all()
BEGIN
    SELECT * FROM FORMATO;
END$$

-- TIPO_SOCIO
DROP PROCEDURE IF EXISTS tipo_socio_create$$
CREATE PROCEDURE tipo_socio_create(IN p_nombre VARCHAR(50), OUT p_id INT)
BEGIN
    INSERT INTO TIPO_SOCIO(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS tipo_socio_get$$
CREATE PROCEDURE tipo_socio_get(IN p_id INT)
BEGIN
    SELECT * FROM TIPO_SOCIO WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS tipo_socio_get_all$$
CREATE PROCEDURE tipo_socio_get_all()
BEGIN
    SELECT * FROM TIPO_SOCIO;
END$$

DROP PROCEDURE IF EXISTS tipo_socio_update$$
CREATE PROCEDURE tipo_socio_update(IN p_id INT, IN p_nombre VARCHAR(50))
BEGIN
    UPDATE TIPO_SOCIO SET nombre = p_nombre WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS tipo_socio_delete$$
CREATE PROCEDURE tipo_socio_delete(IN p_id INT)
BEGIN
    DELETE FROM TIPO_SOCIO WHERE id = p_id;
END$$

-- TIPO_PRODUCTO
DROP PROCEDURE IF EXISTS tipo_producto_create$$
CREATE PROCEDURE tipo_producto_create(IN p_nombre VARCHAR(100), OUT p_id INT)
BEGIN
    INSERT INTO TIPO_PRODUCTO(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS tipo_producto_get$$
CREATE PROCEDURE tipo_producto_get(IN p_id INT)
BEGIN
    SELECT * FROM TIPO_PRODUCTO WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS tipo_producto_get_all$$
CREATE PROCEDURE tipo_producto_get_all()
BEGIN
    SELECT * FROM TIPO_PRODUCTO;
END$$

DROP PROCEDURE IF EXISTS tipo_producto_update$$
CREATE PROCEDURE tipo_producto_update(IN p_id INT, IN p_nombre VARCHAR(100))
BEGIN
    UPDATE TIPO_PRODUCTO SET nombre = p_nombre WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS tipo_producto_delete$$
CREATE PROCEDURE tipo_producto_delete(IN p_id INT)
BEGIN
    DELETE FROM TIPO_PRODUCTO WHERE id = p_id;
END$$

-- PRODUCTO
DROP PROCEDURE IF EXISTS producto_create$$
CREATE PROCEDURE producto_create(IN p_nombre VARCHAR(100), IN p_descripcion TEXT, IN p_precio DECIMAL(5,2), IN p_imagen VARCHAR(255), IN p_tipo INT, OUT p_id INT)
BEGIN
    INSERT INTO PRODUCTO(nombre,descripcion,precio,imagen,tipo) VALUES (p_nombre,p_descripcion,p_precio,p_imagen,p_tipo);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS producto_get$$
CREATE PROCEDURE producto_get(IN p_id INT)
BEGIN
    SELECT * FROM PRODUCTO WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS producto_update$$
CREATE PROCEDURE producto_update(IN p_id INT, IN p_nombre VARCHAR(100), IN p_descripcion TEXT, IN p_precio DECIMAL(5,2), IN p_imagen VARCHAR(255), IN p_tipo INT)
BEGIN
    UPDATE PRODUCTO SET nombre=p_nombre, descripcion=p_descripcion, precio=p_precio, imagen=p_imagen, tipo=p_tipo WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS producto_delete$$
CREATE PROCEDURE producto_delete(IN p_id INT)
BEGIN
    DELETE FROM PRODUCTO WHERE id = p_id;
END$$

-- PROMO
DROP PROCEDURE IF EXISTS promo_create$$
CREATE PROCEDURE promo_create(IN p_nombre VARCHAR(100), IN p_descripcion TEXT, IN p_fecha_inicio DATE, IN p_fecha_fin DATE, IN p_tipo ENUM('porcentaje','fijo'), IN p_valor DECIMAL(10,2), IN p_aplicaA ENUM('todo','productos','funciones'), IN p_estado ENUM('activa','inactiva'), OUT p_id INT)
BEGIN
    INSERT INTO PROMO(nombre,descripcion,fecha_inicio,fecha_fin,tipo,valor,aplicaA,estado) VALUES (p_nombre,p_descripcion,p_fecha_inicio,p_fecha_fin,p_tipo,p_valor,p_aplicaA,p_estado);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS promo_get$$
CREATE PROCEDURE promo_get(IN p_id INT)
BEGIN
    SELECT * FROM PROMO WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS promo_update$$
CREATE PROCEDURE promo_update(IN p_id INT, IN p_nombre VARCHAR(100), IN p_descripcion TEXT, IN p_fecha_inicio DATE, IN p_fecha_fin DATE, IN p_tipo ENUM('porcentaje','fijo'), IN p_valor DECIMAL(10,2), IN p_aplicaA ENUM('todo','productos','funciones'), IN p_estado ENUM('activa','inactiva'))
BEGIN
    UPDATE PROMO SET nombre=p_nombre, descripcion=p_descripcion, fecha_inicio=p_fecha_inicio, fecha_fin=p_fecha_fin, tipo=p_tipo, valor=p_valor, aplicaA=p_aplicaA, estado=p_estado WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS promo_delete$$
CREATE PROCEDURE promo_delete(IN p_id INT)
BEGIN
    DELETE FROM PROMO WHERE id = p_id;
END$$

-- SALA
DROP PROCEDURE IF EXISTS sala_create$$
CREATE PROCEDURE sala_create(IN p_nombre VARCHAR(100), IN p_capacidad INT, IN p_tipo VARCHAR(50), IN p_idCine INT, OUT p_id INT)
BEGIN
    INSERT INTO SALA(nombre,capacidad,tipo,idCine) VALUES (p_nombre,p_capacidad,p_tipo,p_idCine);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS sala_get$$
CREATE PROCEDURE sala_get(IN p_id INT)
BEGIN
    SELECT * FROM SALA WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sala_update$$
CREATE PROCEDURE sala_update(IN p_id INT, IN p_nombre VARCHAR(100), IN p_capacidad INT, IN p_tipo VARCHAR(50), IN p_idCine INT)
BEGIN
    UPDATE SALA SET nombre=p_nombre, capacidad=p_capacidad, tipo=p_tipo, idCine=p_idCine WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sala_delete$$
CREATE PROCEDURE sala_delete(IN p_id INT)
BEGIN
    DELETE FROM SALA WHERE id = p_id;
END$$

-- ASIENTO CRUD (ubicado junto a SALA)
DROP PROCEDURE IF EXISTS asiento_create$$
CREATE PROCEDURE asiento_create(
    IN p_idSala INT, IN p_fila CHAR(1), IN p_numero INT, IN p_tipo ENUM('normal','discapacidad'), OUT p_id INT)
BEGIN
    INSERT INTO ASIENTO(idSala,fila,numero,tipo) VALUES (p_idSala,p_fila,p_numero,p_tipo);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS asiento_get$$
CREATE PROCEDURE asiento_get(IN p_id INT)
BEGIN
    SELECT * FROM ASIENTO WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS asiento_get_by_sala$$
CREATE PROCEDURE asiento_get_by_sala(IN p_idSala INT)
BEGIN
    SELECT * FROM ASIENTO WHERE idSala = p_idSala ORDER BY fila, numero;
END$$

DROP PROCEDURE IF EXISTS asiento_update$$
CREATE PROCEDURE asiento_update(IN p_id INT, IN p_fila CHAR(1), IN p_numero INT, IN p_tipo ENUM('normal','discapacidad'))
BEGIN
    UPDATE ASIENTO SET fila = p_fila, numero = p_numero, tipo = p_tipo WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS asiento_delete$$
CREATE PROCEDURE asiento_delete(IN p_id INT)
BEGIN
    DELETE FROM ASIENTO WHERE id = p_id;
END$$

-- FUNCION
DROP PROCEDURE IF EXISTS funcion_create$$
CREATE PROCEDURE funcion_create(IN p_idPelicula INT, IN p_idSala INT, IN p_idFormato INT, IN p_fecha DATE, IN p_hora TIME, IN p_precio DECIMAL(6,2), IN p_idIdioma INT, IN p_estado ENUM('activa','inactiva'), OUT p_id INT)
BEGIN
    INSERT INTO FUNCION(idPelicula,idSala,idFormato,fecha,hora,precio,idIdioma,estado) VALUES (p_idPelicula,p_idSala,p_idFormato,p_fecha,p_hora,p_precio,p_idIdioma,p_estado);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS funcion_get$$
CREATE PROCEDURE funcion_get(IN p_id INT)
BEGIN
    SELECT * FROM FUNCION WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS funcion_update$$
CREATE PROCEDURE funcion_update(IN p_id INT, IN p_idPelicula INT, IN p_idSala INT, IN p_idFormato INT, IN p_fecha DATE, IN p_hora TIME, IN p_precio DECIMAL(6,2), IN p_idIdioma INT, IN p_estado ENUM('activa','inactiva'))
BEGIN
    UPDATE FUNCION SET idPelicula=p_idPelicula, idSala=p_idSala, idFormato=p_idFormato, fecha=p_fecha, hora=p_hora, precio=p_precio, idIdioma=p_idIdioma, estado=p_estado WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS funcion_delete$$
CREATE PROCEDURE funcion_delete(IN p_id INT)
BEGIN
    DELETE FROM FUNCION WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS funcion_get_all$$
CREATE PROCEDURE funcion_get_all()
BEGIN
    SELECT * FROM FUNCION;
END$$

-- BOLETA
DROP PROCEDURE IF EXISTS boleta_create$$
CREATE PROCEDURE boleta_create(IN p_idUsuario INT, IN p_fecha DATE, OUT p_id INT)
BEGIN
    INSERT INTO BOLETA(idUsuario,fecha) VALUES (p_idUsuario,p_fecha);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS boleta_get$$
CREATE PROCEDURE boleta_get(IN p_id INT)
BEGIN
    SELECT * FROM BOLETA WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS boleta_delete$$
CREATE PROCEDURE boleta_delete(IN p_id INT)
BEGIN
    DELETE FROM BOLETA WHERE id = p_id;
END$$

-- PRODUCTOS_BOLETA (helpers que llaman a recalc)
DROP PROCEDURE IF EXISTS producto_boleta_add$$
CREATE PROCEDURE producto_boleta_add(IN p_idBoleta INT, IN p_idProducto INT, IN p_cantidad INT, IN p_precioUnitario DECIMAL(10,2), OUT p_id INT)
BEGIN
    INSERT INTO PRODUCTOS_BOLETA(idBoleta,idProducto,cantidad,precioUnitario) VALUES (p_idBoleta,p_idProducto,p_cantidad,p_precioUnitario);
    SET p_id = LAST_INSERT_ID();
    CALL recalc_boleta_total(p_idBoleta);
END$$

DROP PROCEDURE IF EXISTS producto_boleta_update$$
CREATE PROCEDURE producto_boleta_update(IN p_id INT, IN p_cantidad INT, IN p_precioUnitario DECIMAL(10,2))
BEGIN
    UPDATE PRODUCTOS_BOLETA SET cantidad = p_cantidad, precioUnitario = p_precioUnitario WHERE id = p_id;
    -- recalcular por idBoleta
    CALL recalc_boleta_total((SELECT idBoleta FROM PRODUCTOS_BOLETA WHERE id = p_id));
END$$

DROP PROCEDURE IF EXISTS producto_boleta_delete$$
CREATE PROCEDURE producto_boleta_delete(IN p_id INT)
BEGIN
    DECLARE v_idBoleta INT;
    SELECT idBoleta INTO v_idBoleta FROM PRODUCTOS_BOLETA WHERE id = p_id;
    DELETE FROM PRODUCTOS_BOLETA WHERE id = p_id;
    IF v_idBoleta IS NOT NULL THEN
        CALL recalc_boleta_total(v_idBoleta);
    END IF;
END$$

-- FUNCIONES_BOLETA (helpers)
DROP PROCEDURE IF EXISTS funcion_boleta_add$$
CREATE PROCEDURE funcion_boleta_add(IN p_idBoleta INT, IN p_idFuncion INT, IN p_cantidad INT, IN p_precioUnitario DECIMAL(10,2), OUT p_id INT)
BEGIN
    INSERT INTO FUNCIONES_BOLETA(idBoleta,idFuncion,cantidad,precioUnitario) VALUES (p_idBoleta,p_idFuncion,p_cantidad,p_precioUnitario);
    SET p_id = LAST_INSERT_ID();
    CALL recalc_boleta_total(p_idBoleta);
END$$

DROP PROCEDURE IF EXISTS funcion_boleta_update$$
CREATE PROCEDURE funcion_boleta_update(IN p_id INT, IN p_cantidad INT, IN p_precioUnitario DECIMAL(10,2))
BEGIN
    UPDATE FUNCIONES_BOLETA SET cantidad = p_cantidad, precioUnitario = p_precioUnitario WHERE id = p_id;
    CALL recalc_boleta_total((SELECT idBoleta FROM FUNCIONES_BOLETA WHERE id = p_id));
END$$

DROP PROCEDURE IF EXISTS funcion_boleta_delete$$
CREATE PROCEDURE funcion_boleta_delete(IN p_id INT)
BEGIN
    DECLARE v_idBoleta INT;
    SELECT idBoleta INTO v_idBoleta FROM FUNCIONES_BOLETA WHERE id = p_id;
    DELETE FROM FUNCIONES_BOLETA WHERE id = p_id;
    IF v_idBoleta IS NOT NULL THEN
        CALL recalc_boleta_total(v_idBoleta);
    END IF;
END$$

-- BOLETA_ASIENTO helpers (reservar/quitar asiento al momento de vender)
-- Valida pertenencia de asiento a la sala de la función y evita duplicados por constraint
DROP PROCEDURE IF EXISTS boleta_asiento_add$$
CREATE PROCEDURE boleta_asiento_add(
    IN p_idBoleta INT, IN p_idFuncion INT, IN p_idAsiento INT, IN p_precioUnitario DECIMAL(10,2), OUT p_id INT)
BEGIN
    DECLARE v_idSalaFuncion INT;
    DECLARE v_idSalaAsiento INT;

    SELECT idSala INTO v_idSalaFuncion FROM FUNCION WHERE id = p_idFuncion;
    SELECT idSala INTO v_idSalaAsiento FROM ASIENTO WHERE id = p_idAsiento;

    IF v_idSalaFuncion IS NULL OR v_idSalaAsiento IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Funcion o Asiento no encontrado';
    END IF;

    IF v_idSalaFuncion <> v_idSalaAsiento THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El asiento no pertenece a la sala de la funcion';
    END IF;

    INSERT INTO BOLETA_ASIENTO(idBoleta,idFuncion,idAsiento,precioUnitario) VALUES (p_idBoleta,p_idFuncion,p_idAsiento,p_precioUnitario);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS boleta_asiento_remove$$
CREATE PROCEDURE boleta_asiento_remove(IN p_id INT)
BEGIN
    DELETE FROM BOLETA_ASIENTO WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS boleta_asiento_get$$
CREATE PROCEDURE boleta_asiento_get(IN p_id INT)
BEGIN
    SELECT * FROM BOLETA_ASIENTO WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS boleta_asiento_get_by_boleta$$
CREATE PROCEDURE boleta_asiento_get_by_boleta(IN p_idBoleta INT)
BEGIN
    SELECT ba.*, a.fila, a.numero, a.tipo
    FROM BOLETA_ASIENTO ba
    JOIN ASIENTO a ON a.id = ba.idAsiento
    WHERE ba.idBoleta = p_idBoleta
    ORDER BY a.fila, a.numero;
END$$

DROP PROCEDURE IF EXISTS boleta_asiento_get_by_funcion$$
CREATE PROCEDURE boleta_asiento_get_by_funcion(IN p_idFuncion INT)
BEGIN
    SELECT ba.*, a.fila, a.numero, a.tipo
    FROM BOLETA_ASIENTO ba
    JOIN ASIENTO a ON a.id = ba.idAsiento
    WHERE ba.idFuncion = p_idFuncion
    ORDER BY a.fila, a.numero;
END$$

DROP PROCEDURE IF EXISTS get_asientos_por_funcion$$
CREATE PROCEDURE get_asientos_por_funcion(IN p_idFuncion INT)
BEGIN
    SELECT a.id AS idAsiento, a.fila, a.numero, a.tipo,
        CASE WHEN ba.id IS NULL THEN 'libre' ELSE 'ocupado' END AS estado,
        ba.idBoleta
    FROM ASIENTO a
    LEFT JOIN BOLETA_ASIENTO ba ON ba.idAsiento = a.id AND ba.idFuncion = p_idFuncion
    WHERE a.idSala = (SELECT idSala FROM FUNCION WHERE id = p_idFuncion)
    ORDER BY a.fila, a.numero;
END$$

-- PROMO_BOLETA helpers
DROP PROCEDURE IF EXISTS promo_boleta_add$$
CREATE PROCEDURE promo_boleta_add(IN p_idBoleta INT, IN p_idPromo INT, OUT p_id INT)
BEGIN
    INSERT INTO PROMO_BOLETA(idBoleta,idPromo) VALUES (p_idBoleta,p_idPromo);
    SET p_id = LAST_INSERT_ID();
    CALL recalc_boleta_total(p_idBoleta);
END$$

DROP PROCEDURE IF EXISTS promo_boleta_remove$$
CREATE PROCEDURE promo_boleta_remove(IN p_id INT)
BEGIN
    DECLARE v_idBoleta INT;
    SELECT idBoleta INTO v_idBoleta FROM PROMO_BOLETA WHERE id = p_id;
    DELETE FROM PROMO_BOLETA WHERE id = p_id;
    IF v_idBoleta IS NOT NULL THEN
        CALL recalc_boleta_total(v_idBoleta);
    END IF;
END$$

DELIMITER ;


-- Índices recomendados para evitar problemas con sql_safe_updates (UPDATE por idBoleta)
ALTER TABLE PRODUCTOS_BOLETA ADD INDEX idx_productos_boleta_idBoleta (idBoleta);
ALTER TABLE FUNCIONES_BOLETA ADD INDEX idx_funciones_boleta_idBoleta (idBoleta);
ALTER TABLE PROMO_BOLETA ADD INDEX idx_promo_boleta_idBoleta (idBoleta);

-- Triggers: al cambiar productos/funciones/promos de una boleta, recalcular
DELIMITER $$
DROP TRIGGER IF EXISTS trg_productos_boleta_after_insert$$
CREATE TRIGGER trg_productos_boleta_after_insert AFTER INSERT ON PRODUCTOS_BOLETA
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(NEW.idBoleta);
END$$

DROP TRIGGER IF EXISTS trg_productos_boleta_after_update$$
CREATE TRIGGER trg_productos_boleta_after_update AFTER UPDATE ON PRODUCTOS_BOLETA
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(NEW.idBoleta);
END$$

DROP TRIGGER IF EXISTS trg_productos_boleta_after_delete$$
CREATE TRIGGER trg_productos_boleta_after_delete AFTER DELETE ON PRODUCTOS_BOLETA
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(OLD.idBoleta);
END$$

DROP TRIGGER IF EXISTS trg_funciones_boleta_after_insert$$
CREATE TRIGGER trg_funciones_boleta_after_insert AFTER INSERT ON FUNCIONES_BOLETA
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(NEW.idBoleta);
END$$

DROP TRIGGER IF EXISTS trg_funciones_boleta_after_update$$
CREATE TRIGGER trg_funciones_boleta_after_update AFTER UPDATE ON FUNCIONES_BOLETA
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(NEW.idBoleta);
END$$

DROP TRIGGER IF EXISTS trg_funciones_boleta_after_delete$$
CREATE TRIGGER trg_funciones_boleta_after_delete AFTER DELETE ON FUNCIONES_BOLETA
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(OLD.idBoleta);
END$$

-- Para PROMO_BOLETA es útil recalcular cuando se inserta/actualiza/elimina una promo aplicada
DROP TRIGGER IF EXISTS trg_promo_boleta_after_insert$$
CREATE TRIGGER trg_promo_boleta_after_insert AFTER INSERT ON PROMO_BOLETA
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(NEW.idBoleta);
END$$

DROP TRIGGER IF EXISTS trg_promo_boleta_after_update$$
CREATE TRIGGER trg_promo_boleta_after_update AFTER UPDATE ON PROMO_BOLETA
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(NEW.idBoleta);
END$$

DROP TRIGGER IF EXISTS trg_promo_boleta_after_delete$$
CREATE TRIGGER trg_promo_boleta_after_delete AFTER DELETE ON PROMO_BOLETA
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(OLD.idBoleta);
END$$
DELIMITER ;

-- GENERO CRUD
DELIMITER $$

DROP PROCEDURE IF EXISTS genero_create$$
CREATE PROCEDURE genero_create(IN p_nombre VARCHAR(100), OUT p_id INT)
BEGIN
    INSERT INTO GENERO(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS genero_get$$
CREATE PROCEDURE genero_get(IN p_id INT)
BEGIN
    SELECT * FROM GENERO WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS genero_get_all$$
CREATE PROCEDURE genero_get_all()
BEGIN
    SELECT * FROM GENERO;
END$$

DROP PROCEDURE IF EXISTS genero_update$$
CREATE PROCEDURE genero_update(IN p_id INT, IN p_nombre VARCHAR(100))
BEGIN
    UPDATE GENERO SET nombre = p_nombre WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS genero_delete$$
CREATE PROCEDURE genero_delete(IN p_id INT)
BEGIN
    DELETE FROM GENERO WHERE id = p_id;
END$$

DELIMITER ;


--Restriccion

DELIMITER $$
DROP PROCEDURE IF EXISTS restriccion_create$$
CREATE PROCEDURE restriccion_create(IN p_nombre VARCHAR(100), OUT p_id INT)
BEGIN
    INSERT INTO RESTRICCION(tipo) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS restriccion_get$$
CREATE PROCEDURE restriccion_get(IN p_id INT)
BEGIN
    SELECT * FROM RESTRICCION WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS restriccion_get_all$$
CREATE PROCEDURE restriccion_get_all()
BEGIN
    SELECT * FROM RESTRICCION;
END$$

DROP PROCEDURE IF EXISTS restriccion_update$$
CREATE PROCEDURE restriccion_update(IN p_id INT, IN p_nombre VARCHAR(100))
BEGIN
    UPDATE RESTRICCION SET nombre = p_nombre WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS restriccion_delete$$
CREATE PROCEDURE restriccion_delete(IN p_id INT)
BEGIN
    DELETE FROM RESTRICCION WHERE id = p_id;
END$$