-- Procedimientos Almacenados
DELIMITER $$

-- Procedimientos para CINE
CREATE PROCEDURE cine_get_by_id(IN p_id INT)
BEGIN
    SELECT id, nombre, direccion, telefono, email, imagen, idCiudad 
    FROM CINE 
    WHERE id = p_id;
END$$

CREATE PROCEDURE cine_create(
    IN p_nombre VARCHAR(100),
    IN p_direccion VARCHAR(255),
    IN p_telefono VARCHAR(20),
    IN p_email VARCHAR(100),
    IN p_imagen VARCHAR(255),
    IN p_idCiudad INT,
    OUT p_id INT
)
BEGIN
    INSERT INTO CINE(nombre, direccion, telefono, email, imagen, idCiudad)
    VALUES (p_nombre, p_direccion, p_telefono, p_email, p_imagen, p_idCiudad);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE cine_delete(IN p_id INT)
BEGIN
    DELETE FROM CINE WHERE id = p_id;
END$$

CREATE PROCEDURE cine_get_by_ciudad(IN p_idCiudad INT)
BEGIN
    SELECT id, nombre 
    FROM CINE 
    WHERE idCiudad = p_idCiudad 
    ORDER BY nombre ASC;
END$$

CREATE PROCEDURE cine_get_all_with_ciudad()
BEGIN
    SELECT CINE.*, CIUDAD.nombre AS ciudad 
    FROM CINE 
    LEFT JOIN CIUDAD ON CINE.idCiudad = CIUDAD.id 
    ORDER BY CINE.nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para CIUDAD
CREATE PROCEDURE ciudad_get_by_id(IN p_id INT)
BEGIN
    SELECT id, nombre FROM CIUDAD WHERE id = p_id;
END$$

CREATE PROCEDURE ciudad_create(IN p_nombre VARCHAR(100), OUT p_id INT)
BEGIN
    INSERT INTO CIUDAD(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE ciudad_update(IN p_id INT, IN p_nombre VARCHAR(100))
BEGIN
    UPDATE CIUDAD SET nombre = p_nombre WHERE id = p_id;
END$$

CREATE PROCEDURE ciudad_delete(IN p_id INT)
BEGIN
    DELETE FROM CIUDAD WHERE id = p_id;
END$$

CREATE PROCEDURE ciudad_get_all()
BEGIN
    SELECT id, nombre FROM CIUDAD ORDER BY nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para FORMATO
CREATE PROCEDURE formato_get_by_id(IN p_id INT)
BEGIN
    SELECT id, nombre FROM FORMATO WHERE id = p_id;
END$$

CREATE PROCEDURE formato_create(IN p_nombre VARCHAR(50), OUT p_id INT)
BEGIN
    INSERT INTO FORMATO(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE formato_update(IN p_id INT, IN p_nombre VARCHAR(50))
BEGIN
    UPDATE FORMATO SET nombre = p_nombre WHERE id = p_id;
END$$

CREATE PROCEDURE formato_delete(IN p_id INT)
BEGIN
    DELETE FROM FORMATO WHERE id = p_id;
END$$

CREATE PROCEDURE formato_get_all()
BEGIN
    SELECT id, nombre FROM FORMATO ORDER BY nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para GENERO
CREATE PROCEDURE genero_get_by_id(IN p_id INT)
BEGIN
    SELECT id, nombre FROM GENERO WHERE id = p_id;
END$$

CREATE PROCEDURE genero_create(IN p_nombre VARCHAR(100), OUT p_id INT)
BEGIN
    INSERT INTO GENERO(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE genero_update(IN p_id INT, IN p_nombre VARCHAR(100))
BEGIN
    UPDATE GENERO SET nombre = p_nombre WHERE id = p_id;
END$$

CREATE PROCEDURE genero_delete(IN p_id INT)
BEGIN
    DELETE FROM GENERO WHERE id = p_id;
END$$

CREATE PROCEDURE genero_get_all()
BEGIN
    SELECT id, nombre FROM GENERO ORDER BY nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para IDIOMA
CREATE PROCEDURE idioma_get_by_id(IN p_id INT)
BEGIN
    SELECT id, nombre FROM IDIOMA WHERE id = p_id;
END$$

CREATE PROCEDURE idioma_create(IN p_nombre VARCHAR(50), OUT p_id INT)
BEGIN
    INSERT INTO IDIOMA(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE idioma_update(IN p_id INT, IN p_nombre VARCHAR(50))
BEGIN
    UPDATE IDIOMA SET nombre = p_nombre WHERE id = p_id;
END$$

CREATE PROCEDURE idioma_delete(IN p_id INT)
BEGIN
    DELETE FROM IDIOMA WHERE id = p_id;
END$$

CREATE PROCEDURE idioma_get_all()
BEGIN
    SELECT id, nombre FROM IDIOMA ORDER BY nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para RESTRICCION
CREATE PROCEDURE restriccion_get_by_id(IN p_id INT)
BEGIN
    SELECT id, nombre FROM RESTRICCION WHERE id = p_id;
END$$

CREATE PROCEDURE restriccion_create(IN p_nombre VARCHAR(50), OUT p_id INT)
BEGIN
    INSERT INTO RESTRICCION(nombre) VALUES (p_nombre);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE restriccion_update(IN p_id INT, IN p_nombre VARCHAR(50))
BEGIN
    UPDATE RESTRICCION SET nombre = p_nombre WHERE id = p_id;
END$$

CREATE PROCEDURE restriccion_delete(IN p_id INT)
BEGIN
    DELETE FROM RESTRICCION WHERE id = p_id;
END$$

CREATE PROCEDURE restriccion_get_all()
BEGIN
    SELECT id, nombre FROM RESTRICCION ORDER BY nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para SALA
CREATE PROCEDURE sala_get_by_id(IN p_id INT)
BEGIN
    SELECT id, nombre, capacidad, tipo, idCine FROM SALA WHERE id = p_id;
END$$

CREATE PROCEDURE sala_update(
    IN p_id INT,
    IN p_nombre VARCHAR(100),
    IN p_capacidad INT,
    IN p_tipo VARCHAR(50),
    IN p_idCine INT
)
BEGIN
    UPDATE SALA SET nombre = p_nombre, capacidad = p_capacidad, tipo = p_tipo, idCine = p_idCine WHERE id = p_id;
END$$

CREATE PROCEDURE sala_delete(IN p_id INT)
BEGIN
    DELETE FROM SALA WHERE id = p_id;
END$$

CREATE PROCEDURE sala_get_all()
BEGIN
    SELECT id, nombre, capacidad, tipo, idCine FROM SALA ORDER BY nombre ASC;
END$$

CREATE PROCEDURE sala_get_by_cine(IN p_idCine INT)
BEGIN
    SELECT id, nombre, capacidad, tipo FROM SALA WHERE idCine = p_idCine ORDER BY nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para PRODUCTO
CREATE PROCEDURE producto_get_by_id(IN p_id INT)
BEGIN
    SELECT * FROM PRODUCTO WHERE id = p_id;
END$$

CREATE PROCEDURE producto_update(
    IN p_id INT,
    IN p_nombre VARCHAR(100),
    IN p_descripcion TEXT,
    IN p_precio DECIMAL(10,2),
    IN p_imagen VARCHAR(255),
    IN p_tipo ENUM('snack','bebida','combo','merch','dulce','complementario','otro'),
    IN p_estado ENUM('activo','inactivo'),
    IN p_requiereSocio TINYINT(1),
    IN p_gradoMinimo ENUM('clasico','plata','oro','black'),
    IN p_requiereEmpleado TINYINT(1),
    IN p_canjeaPuntos TINYINT(1),
    IN p_puntosNecesarios INT
)
BEGIN
    UPDATE PRODUCTO SET
        nombre = p_nombre,
        descripcion = p_descripcion,
        precio = p_precio,
        imagen = p_imagen,
        tipo = p_tipo,
        estado = p_estado,
        requiereSocio = p_requiereSocio,
        gradoMinimo = p_gradoMinimo,
        requiereEmpleado = p_requiereEmpleado,
        canjeaPuntos = p_canjeaPuntos,
        puntosNecesarios = p_puntosNecesarios
    WHERE id = p_id;
END$$

CREATE PROCEDURE producto_delete(IN p_id INT)
BEGIN
    DELETE FROM PRODUCTO WHERE id = p_id;
END$$

CREATE PROCEDURE producto_get_all()
BEGIN
    SELECT * FROM PRODUCTO ORDER BY nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para PELICULA
CREATE PROCEDURE pelicula_get_by_id(IN p_id INT)
BEGIN
    SELECT * FROM PELICULA WHERE id = p_id;
END$$

CREATE PROCEDURE pelicula_update(
    IN p_id INT,
    IN p_nombre VARCHAR(100),
    IN p_genero INT,
    IN p_duracion INT,
    IN p_restriccion INT,
    IN p_restriccionComercial TINYINT(1),
    IN p_sinopsis TEXT,
    IN p_autor VARCHAR(100),
    IN p_trailer VARCHAR(255),
    IN p_portada VARCHAR(255),
    IN p_estado ENUM('activa','inactiva')
)
BEGIN
    UPDATE PELICULA SET
        nombre = p_nombre,
        genero = p_genero,
        duracion = p_duracion,
        restriccion = p_restriccion,
        restriccionComercial = p_restriccionComercial,
        sinopsis = p_sinopsis,
        autor = p_autor,
        trailer = p_trailer,
        portada = p_portada,
        estado = p_estado
    WHERE id = p_id;
END$$

CREATE PROCEDURE pelicula_delete(IN p_id INT)
BEGIN
    DELETE FROM PELICULA WHERE id = p_id;
END$$

CREATE PROCEDURE pelicula_get_all()
BEGIN
    SELECT * FROM PELICULA ORDER BY nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para FUNCION
CREATE PROCEDURE funcion_get_by_id(IN p_id INT)
BEGIN
    SELECT * FROM FUNCION WHERE id = p_id;
END$$

CREATE PROCEDURE funcion_create(
    IN p_idPelicula INT,
    IN p_idSala INT,
    IN p_idFormato INT,
    IN p_idIdioma INT,
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_precio DECIMAL(6,2),
    IN p_estado ENUM('activa','inactiva','preventa'),
    OUT p_id INT
)
BEGIN
    INSERT INTO FUNCION(idPelicula, idSala, idFormato, idIdioma, fecha, hora, precio, estado)
    VALUES (p_idPelicula, p_idSala, p_idFormato, p_idIdioma, p_fecha, p_hora, p_precio, p_estado);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE funcion_update(
    IN p_id INT,
    IN p_idPelicula INT,
    IN p_idSala INT,
    IN p_idFormato INT,
    IN p_idIdioma INT,
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_precio DECIMAL(6,2),
    IN p_estado ENUM('activa','inactiva','preventa')
)
BEGIN
    UPDATE FUNCION SET
        idPelicula = p_idPelicula,
        idSala = p_idSala,
        idFormato = p_idFormato,
        idIdioma = p_idIdioma,
        fecha = p_fecha,
        hora = p_hora,
        precio = p_precio,
        estado = p_estado
    WHERE id = p_id;
END$$

CREATE PROCEDURE funcion_delete(IN p_id INT)
BEGIN
    DELETE FROM FUNCION WHERE id = p_id;
END$$

CREATE PROCEDURE funcion_get_all()
BEGIN
    SELECT * FROM FUNCION ORDER BY fecha DESC, hora DESC;
END$$

-- ===============================================================================================

-- Procedimientos para PROMO
CREATE PROCEDURE promo_get_by_id(IN p_id INT)
BEGIN
    SELECT * FROM PROMO WHERE id = p_id;
END$$

CREATE PROCEDURE promo_create(
    IN p_nombre VARCHAR(100),
    IN p_descripcion TEXT,
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    IN p_tipo ENUM('porcentaje','fijo'),
    IN p_valor DECIMAL(10,2),
    IN p_aplicaA ENUM('todo','productos','funciones'),
    IN p_requiereSocio TINYINT(1),
    IN p_gradoMinimo ENUM('clasico','plata','oro','black'),
    IN p_requiereEmpleado TINYINT(1),
    IN p_combinable TINYINT(1),
    IN p_requierePuntos TINYINT(1),
    IN p_puntosNecesarios INT,
    IN p_tieneStock TINYINT(1),
    IN p_stock INT,
    IN p_aplicaRestriccion TINYINT(1),
    IN p_estado ENUM('activa','inactiva'),
    OUT p_id INT
)
BEGIN
    INSERT INTO PROMO(
        nombre, descripcion, fecha_inicio, fecha_fin, tipo, valor, aplicaA,
        requiereSocio, gradoMinimo, requiereEmpleado, combinable,
        requierePuntos, puntosNecesarios, tieneStock, stock, aplicaRestriccion, estado
    ) VALUES (
        p_nombre, p_descripcion, p_fecha_inicio, p_fecha_fin, p_tipo, p_valor, p_aplicaA,
        p_requiereSocio, p_gradoMinimo, p_requiereEmpleado, p_combinable,
        p_requierePuntos, p_puntosNecesarios, p_tieneStock, p_stock, p_aplicaRestriccion, p_estado
    );
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE promo_update(
    IN p_id INT,
    IN p_nombre VARCHAR(100),
    IN p_descripcion TEXT,
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    IN p_tipo ENUM('porcentaje','fijo'),
    IN p_valor DECIMAL(10,2),
    IN p_aplicaA ENUM('todo','productos','funciones'),
    IN p_requiereSocio TINYINT(1),
    IN p_gradoMinimo ENUM('clasico','plata','oro','black'),
    IN p_requiereEmpleado TINYINT(1),
    IN p_combinable TINYINT(1),
    IN p_requierePuntos TINYINT(1),
    IN p_puntosNecesarios INT,
    IN p_tieneStock TINYINT(1),
    IN p_stock INT,
    IN p_aplicaRestriccion TINYINT(1),
    IN p_estado ENUM('activa','inactiva')
)
BEGIN
    UPDATE PROMO SET
        nombre = p_nombre,
        descripcion = p_descripcion,
        fecha_inicio = p_fecha_inicio,
        fecha_fin = p_fecha_fin,
        tipo = p_tipo,
        valor = p_valor,
        aplicaA = p_aplicaA,
        requiereSocio = p_requiereSocio,
        gradoMinimo = p_gradoMinimo,
        requiereEmpleado = p_requiereEmpleado,
        combinable = p_combinable,
        requierePuntos = p_requierePuntos,
        puntosNecesarios = p_puntosNecesarios,
        tieneStock = p_tieneStock,
        stock = p_stock,
        aplicaRestriccion = p_aplicaRestriccion,
        estado = p_estado
    WHERE id = p_id;
END$$

CREATE PROCEDURE promo_delete(IN p_id INT)
BEGIN
    DELETE FROM PROMO WHERE id = p_id;
END$$

CREATE PROCEDURE promo_get_all()
BEGIN
    SELECT * FROM PROMO ORDER BY nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para USUARIO
CREATE PROCEDURE usuario_get_by_id(IN p_id INT)
BEGIN
    SELECT * FROM USUARIO WHERE id = p_id;
END$$

CREATE PROCEDURE usuario_delete(IN p_id INT)
BEGIN
    DELETE FROM USUARIO WHERE id = p_id;
END$$

CREATE PROCEDURE usuario_get_all()
BEGIN
    SELECT * FROM USUARIO ORDER BY nombre ASC;
END$$

-- ===============================================================================================

-- Procedimientos para SOCIO
CREATE PROCEDURE socio_get_by_id(IN p_id INT)
BEGIN
    SELECT * FROM SOCIO WHERE id = p_id;
END$$

CREATE PROCEDURE socio_delete(IN p_id INT)
BEGIN
    DELETE FROM SOCIO WHERE id = p_id;
END$$

CREATE PROCEDURE socio_get_all()
BEGIN
    SELECT s.*, u.nombre, u.email 
    FROM SOCIO s 
    INNER JOIN USUARIO u ON s.id = u.id 
    ORDER BY u.nombre ASC;
END$$

-- ===============================================================================================

-- Procedimiento crítico para recalcular totales de boletas (usado en triggers y helpers)
CREATE PROCEDURE recalc_boleta_total(IN p_idBoleta INT)
BEGIN
    DECLARE v_prod_sub DECIMAL(14,2) DEFAULT 0;
    DECLARE v_asiento_sub DECIMAL(14,2) DEFAULT 0;
    DECLARE v_subtotal DECIMAL(14,2) DEFAULT 0;
    DECLARE v_desc_total DECIMAL(14,2) DEFAULT 0;
    DECLARE v_got_lock INT DEFAULT 0;

    SET v_got_lock = GET_LOCK(CONCAT('recalc_lock_', p_idBoleta), 5);

    IF v_got_lock = 1 THEN
        SELECT IFNULL(SUM(cantidad * precioUnitario),0) INTO v_prod_sub FROM PRODUCTOS_BOLETA WHERE idBoleta = p_idBoleta;
        SELECT IFNULL(SUM(precioUnitario),0) INTO v_asiento_sub FROM BOLETA_ASIENTO WHERE idBoleta = p_idBoleta;
        SET v_subtotal = v_prod_sub + v_asiento_sub;

        SELECT IFNULL(SUM(
            CASE p.tipo
                WHEN 'porcentaje' THEN
                    CASE p.aplicaA
                        WHEN 'productos' THEN (v_prod_sub * p.valor / 100)
                        WHEN 'funciones' THEN (v_asiento_sub * p.valor / 100)
                        ELSE (v_subtotal * p.valor / 100)
                    END
                WHEN 'fijo' THEN p.valor
                ELSE 0
            END
        ), 0) INTO v_desc_total
        FROM PROMO_BOLETA pb
        JOIN PROMO p ON pb.idPromo = p.id
        WHERE pb.idBoleta = p_idBoleta AND p.estado = 'activa';

        IF v_desc_total > v_subtotal THEN
            SET v_desc_total = v_subtotal;
        END IF;

        UPDATE BOLETA
        SET subtotal = ROUND(v_subtotal,2),
            descuentoTotal = ROUND(v_desc_total,2),
            total = ROUND(GREATEST(0, v_subtotal - v_desc_total),2)
        WHERE id = p_idBoleta;

        DO RELEASE_LOCK(CONCAT('recalc_lock_', p_idBoleta));
    END IF;
END$$

-- ===============================================================================================

-- Procedimientos adicionales para USUARIO (con campo tipo)
CREATE PROCEDURE usuario_create(
    IN p_nombre VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_tipoDocumento VARCHAR(20),
    IN p_numeroDocumento VARCHAR(20),
    IN p_tipo ENUM('cliente','admin'),
    OUT p_id INT
)
BEGIN
    INSERT INTO USUARIO(nombre, email, tipoDocumento, numeroDocumento, tipo)
    VALUES (p_nombre, p_email, p_tipoDocumento, p_numeroDocumento, p_tipo);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE usuario_get(IN p_id INT)
BEGIN
    SELECT * FROM USUARIO WHERE id = p_id;
END$$

CREATE PROCEDURE usuario_update(
    IN p_id INT,
    IN p_nombre VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_tipoDocumento VARCHAR(20),
    IN p_numeroDocumento VARCHAR(20)
)
BEGIN
    UPDATE USUARIO SET nombre = p_nombre, email = p_email, tipoDocumento = p_tipoDocumento, numeroDocumento = p_numeroDocumento WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimientos adicionales para CINE (con update y get)
CREATE PROCEDURE cine_get(IN p_id INT)
BEGIN
    SELECT * FROM CINE WHERE id = p_id;
END$$

CREATE PROCEDURE cine_update(
    IN p_id INT,
    IN p_nombre VARCHAR(100),
    IN p_direccion VARCHAR(255),
    IN p_telefono VARCHAR(20),
    IN p_email VARCHAR(100),
    IN p_imagen VARCHAR(255),
    IN p_idCiudad INT
)
BEGIN
    UPDATE CINE SET
        nombre=p_nombre,
        direccion=p_direccion,
        telefono=p_telefono,
        email=p_email,
        imagen=p_imagen,
        idCiudad=p_idCiudad
    WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimientos adicionales para CIUDAD (get)
CREATE PROCEDURE ciudad_get(IN p_id INT)
BEGIN
    SELECT * FROM CIUDAD WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimientos para SOCIO (CRUD completo)
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
    IN p_puntos INT,
    IN p_visitas INT,
    IN p_empleado TINYINT(1),
    IN p_grado ENUM('clasico','plata','oro','black')
)
BEGIN
    INSERT INTO SOCIO(id,password,departamento,provincia,distrito,apellidoPaterno,apellidoMaterno,
                      cineplanetFavorito,fechaNacimiento,celular,genero,puntos,visitas,empleado,grado)
    VALUES (p_idUsuario,p_password,p_departamento,p_provincia,p_distrito,p_apellidoPaterno,
            p_apellidoMaterno,p_cineplanetFavorito,p_fechaNacimiento,p_celular,p_genero,
            p_puntos,p_visitas,p_empleado,p_grado);
END$$

CREATE PROCEDURE socio_get(IN p_id INT)
BEGIN
    SELECT * FROM SOCIO WHERE id = p_id;
END$$

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
    IN p_puntos INT,
    IN p_visitas INT,
    IN p_empleado TINYINT(1),
    IN p_grado ENUM('clasico','plata','oro','black')
)
BEGIN
    UPDATE SOCIO SET 
        password = p_password, 
        departamento = p_departamento, 
        provincia = p_provincia, 
        distrito = p_distrito, 
        apellidoPaterno = p_apellidoPaterno, 
        apellidoMaterno = p_apellidoMaterno, 
        cineplanetFavorito = p_cineplanetFavorito, 
        fechaNacimiento = p_fechaNacimiento, 
        celular = p_celular, 
        genero = p_genero, 
        puntos = p_puntos, 
        visitas = p_visitas, 
        empleado = p_empleado, 
        grado = p_grado 
    WHERE id = p_id;
END$$

CREATE PROCEDURE socio_login(
    IN p_numeroDocumento VARCHAR(20),
    IN p_password VARCHAR(255)
)
BEGIN
    SELECT 
        u.id, u.nombre, u.email, u.tipoDocumento, u.numeroDocumento, u.tipo,
        s.password, s.departamento, s.provincia, s.distrito,
        s.apellidoPaterno, s.apellidoMaterno, s.cineplanetFavorito,
        s.fechaNacimiento, s.celular, s.genero, s.puntos, s.visitas,
        s.empleado, s.grado
    FROM USUARIO u
    JOIN SOCIO s ON u.id = s.id
    WHERE u.numeroDocumento = p_numeroDocumento AND s.password = p_password
    LIMIT 1;
END$$

-- ===============================================================================================

-- Procedimientos para PELICULA (create, get, get_active, idioma, formato)
CREATE PROCEDURE pelicula_create(
    IN p_nombre VARCHAR(100),
    IN p_genero INT,
    IN p_duracion INT,
    IN p_restriccion INT,
    IN p_restriccionComercial BOOLEAN,
    IN p_sinopsis TEXT,
    IN p_autor VARCHAR(100),
    IN p_trailer VARCHAR(255),
    IN p_portada VARCHAR(255),
    IN p_estado ENUM('activa','inactiva'),
    OUT p_id INT
)
BEGIN
    INSERT INTO PELICULA(nombre,genero,duracion,restriccion,restriccionComercial,sinopsis,autor,trailer,portada,estado)
    VALUES (p_nombre,p_genero,p_duracion,p_restriccion,p_restriccionComercial,p_sinopsis,p_autor,p_trailer,p_portada,p_estado);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE pelicula_get(IN p_id INT)
BEGIN
    SELECT * FROM PELICULA WHERE id = p_id;
END$$

CREATE PROCEDURE pelicula_get_active()
BEGIN
    SELECT * FROM PELICULA WHERE estado = 'activa';
END$$

CREATE PROCEDURE pelicula_idioma_add(IN p_idPelicula INT, IN p_idIdioma INT)
BEGIN
    INSERT IGNORE INTO PELICULA_IDIOMA(idPelicula,idIdioma) VALUES (p_idPelicula,p_idIdioma);
END$$

CREATE PROCEDURE pelicula_idioma_remove(IN p_idPelicula INT, IN p_idIdioma INT)
BEGIN
    DELETE FROM PELICULA_IDIOMA WHERE idPelicula = p_idPelicula AND idIdioma = p_idIdioma;
END$$

CREATE PROCEDURE pelicula_formato_add(IN p_idPelicula INT, IN p_idFormato INT)
BEGIN
    INSERT IGNORE INTO PELICULA_FORMATO(idPelicula,idFormato) VALUES (p_idPelicula,p_idFormato);
END$$

CREATE PROCEDURE pelicula_formato_remove(IN p_idPelicula INT, IN p_idFormato INT)
BEGIN
    DELETE FROM PELICULA_FORMATO WHERE idPelicula = p_idPelicula AND idFormato = p_idFormato;
END$$

-- ===============================================================================================

-- Procedimientos para PRODUCTO (create y get)
CREATE PROCEDURE producto_create(
    IN p_nombre VARCHAR(100),
    IN p_descripcion TEXT,
    IN p_precio DECIMAL(10,2),
    IN p_imagen VARCHAR(255),
    IN p_tipo ENUM('snack','bebida','combo','merch','dulce','complementario','otro'),
    IN p_estado ENUM('activo','inactivo'),
    IN p_requiereSocio TINYINT(1),
    IN p_gradoMinimo ENUM('clasico','plata','oro','black'),
    IN p_requiereEmpleado TINYINT(1),
    IN p_canjeaPuntos TINYINT(1),
    IN p_puntosNecesarios INT,
    OUT p_id INT
)
BEGIN
    INSERT INTO PRODUCTO(nombre, descripcion, precio, imagen, tipo, estado,
                         requiereSocio, gradoMinimo, requiereEmpleado,
                         canjeaPuntos, puntosNecesarios)
    VALUES (p_nombre, p_descripcion, p_precio, p_imagen, p_tipo, p_estado,
            p_requiereSocio, p_gradoMinimo, p_requiereEmpleado,
            p_canjeaPuntos, p_puntosNecesarios);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE producto_get(IN p_id INT)
BEGIN
    SELECT * FROM PRODUCTO WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimientos para SALA (create)
CREATE PROCEDURE sala_create(
    IN p_nombre VARCHAR(100),
    IN p_capacidad INT,
    IN p_tipo VARCHAR(50),
    IN p_idCine INT,
    OUT p_id INT
)
BEGIN
    INSERT INTO SALA(nombre, capacidad, tipo, idCine) 
    VALUES (p_nombre, p_capacidad, p_tipo, p_idCine);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE sala_get(IN p_id INT)
BEGIN
    SELECT * FROM SALA WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimientos para PLANO_SALA
CREATE PROCEDURE plano_sala_create(
    IN p_idSala INT,
    IN p_fila CHAR(1),
    IN p_numero INT,
    IN p_tipo ENUM('normal','discapacidad','pasillo'),
    OUT p_id INT
)
BEGIN
    INSERT INTO PLANO_SALA(idSala,fila,numero,tipo) 
    VALUES (p_idSala,p_fila,p_numero,p_tipo);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE plano_sala_get(IN p_id INT)
BEGIN
    SELECT * FROM PLANO_SALA WHERE id = p_id;
END$$

CREATE PROCEDURE plano_sala_get_by_sala(IN p_idSala INT)
BEGIN
    SELECT * FROM PLANO_SALA WHERE idSala = p_idSala ORDER BY fila, numero;
END$$

CREATE PROCEDURE plano_sala_update(
    IN p_id INT,
    IN p_fila CHAR(1),
    IN p_numero INT,
    IN p_tipo ENUM('normal','discapacidad','pasillo')
)
BEGIN
    UPDATE PLANO_SALA SET fila = p_fila, numero = p_numero, tipo = p_tipo WHERE id = p_id;
END$$

CREATE PROCEDURE plano_sala_delete(IN p_id INT)
BEGIN
    DELETE FROM PLANO_SALA WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimientos para FUNCION (get)
CREATE PROCEDURE funcion_get(IN p_id INT)
BEGIN
    SELECT * FROM FUNCION WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimientos para BOLETA
CREATE PROCEDURE boleta_create(
    IN p_idUsuario INT,
    IN p_fecha DATE,
    OUT p_id INT
)
BEGIN
    INSERT INTO BOLETA(idUsuario,fecha) VALUES (p_idUsuario,p_fecha);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE boleta_get(IN p_id INT)
BEGIN
    SELECT * FROM BOLETA WHERE id = p_id;
END$$

CREATE PROCEDURE boleta_delete(IN p_id INT)
BEGIN
    DELETE FROM BOLETA WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimientos para PRODUCTOS_BOLETA (helpers que llaman a recalc)
CREATE PROCEDURE producto_boleta_add(
    IN p_idBoleta INT,
    IN p_idProducto INT,
    IN p_cantidad INT,
    IN p_precioUnitario DECIMAL(10,2),
    OUT p_id INT
)
BEGIN
    INSERT INTO PRODUCTOS_BOLETA(idBoleta,idProducto,cantidad,precioUnitario) 
    VALUES (p_idBoleta,p_idProducto,p_cantidad,p_precioUnitario);
    SET p_id = LAST_INSERT_ID();
    CALL recalc_boleta_total(p_idBoleta);
END$$

CREATE PROCEDURE producto_boleta_update(
    IN p_id INT,
    IN p_cantidad INT,
    IN p_precioUnitario DECIMAL(10,2)
)
BEGIN
    UPDATE PRODUCTOS_BOLETA SET cantidad = p_cantidad, precioUnitario = p_precioUnitario WHERE id = p_id;
    CALL recalc_boleta_total((SELECT idBoleta FROM PRODUCTOS_BOLETA WHERE id = p_id));
END$$

CREATE PROCEDURE producto_boleta_delete(IN p_id INT)
BEGIN
    DECLARE v_idBoleta INT;
    SELECT idBoleta INTO v_idBoleta FROM PRODUCTOS_BOLETA WHERE id = p_id;
    DELETE FROM PRODUCTOS_BOLETA WHERE id = p_id;
    IF v_idBoleta IS NOT NULL THEN
        CALL recalc_boleta_total(v_idBoleta);
    END IF;
END$$

-- ===============================================================================================

-- Procedimientos para FUNCIONES_BOLETA
CREATE PROCEDURE funcion_boleta_add(
    IN p_idBoleta INT,
    IN p_idFuncion INT,
    IN p_cantidad INT,
    IN p_precioUnitario DECIMAL(10,2),
    OUT p_id INT
)
BEGIN
    INSERT INTO FUNCIONES_BOLETA(idBoleta,idFuncion,cantidad,precioUnitario) 
    VALUES (p_idBoleta,p_idFuncion,p_cantidad,p_precioUnitario);
    SET p_id = LAST_INSERT_ID();
    CALL recalc_boleta_total(p_idBoleta);
END$$

CREATE PROCEDURE funcion_boleta_update(
    IN p_id INT,
    IN p_cantidad INT,
    IN p_precioUnitario DECIMAL(10,2)
)
BEGIN
    UPDATE FUNCIONES_BOLETA SET cantidad = p_cantidad, precioUnitario = p_precioUnitario WHERE id = p_id;
    CALL recalc_boleta_total((SELECT idBoleta FROM FUNCIONES_BOLETA WHERE id = p_id));
END$$

CREATE PROCEDURE funcion_boleta_delete(IN p_id INT)
BEGIN
    DECLARE v_idBoleta INT;
    SELECT idBoleta INTO v_idBoleta FROM FUNCIONES_BOLETA WHERE id = p_id;
    DELETE FROM FUNCIONES_BOLETA WHERE id = p_id;
    IF v_idBoleta IS NOT NULL THEN
        CALL recalc_boleta_total(v_idBoleta);
    END IF;
END$$

-- ===============================================================================================

-- Procedimientos para BOLETA_ASIENTO
CREATE PROCEDURE boleta_asiento_add(
    IN p_idBoleta INT,
    IN p_idFuncion INT,
    IN p_idPlanoSala INT,
    IN p_precioUnitario DECIMAL(10,2),
    OUT p_id INT
)
BEGIN
    DECLARE v_idSalaFuncion INT;
    DECLARE v_idSalaAsiento INT;

    SELECT idSala INTO v_idSalaFuncion FROM FUNCION WHERE id = p_idFuncion;
    SELECT idSala INTO v_idSalaAsiento FROM PLANO_SALA WHERE id = p_idPlanoSala;

    IF v_idSalaFuncion IS NULL OR v_idSalaAsiento IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Funcion o Asiento no encontrado';
    END IF;

    IF v_idSalaFuncion <> v_idSalaAsiento THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El asiento no pertenece a la sala de la funcion';
    END IF;

    INSERT INTO BOLETA_ASIENTO(idBoleta,idFuncion,idPlanoSala,precioUnitario) 
    VALUES (p_idBoleta,p_idFuncion,p_idPlanoSala,p_precioUnitario);
    SET p_id = LAST_INSERT_ID();
    CALL recalc_boleta_total(p_idBoleta);
END$$

CREATE PROCEDURE boleta_asiento_remove(IN p_id INT)
BEGIN
    DECLARE v_idBoleta INT;
    SELECT idBoleta INTO v_idBoleta FROM BOLETA_ASIENTO WHERE id = p_id;
    DELETE FROM BOLETA_ASIENTO WHERE id = p_id;
    IF v_idBoleta IS NOT NULL THEN
        CALL recalc_boleta_total(v_idBoleta);
    END IF;
END$$

CREATE PROCEDURE boleta_asiento_get(IN p_id INT)
BEGIN
    SELECT * FROM BOLETA_ASIENTO WHERE id = p_id;
END$$

CREATE PROCEDURE boleta_asiento_get_by_boleta(IN p_idBoleta INT)
BEGIN
    SELECT ba.*, ps.fila, ps.numero, ps.tipo
    FROM BOLETA_ASIENTO ba
    JOIN PLANO_SALA ps ON ps.id = ba.idPlanoSala
    WHERE ba.idBoleta = p_idBoleta
    ORDER BY ps.fila, ps.numero;
END$$

CREATE PROCEDURE boleta_asiento_get_by_funcion(IN p_idFuncion INT)
BEGIN
    SELECT ba.*, ps.fila, ps.numero, ps.tipo
    FROM BOLETA_ASIENTO ba
    JOIN PLANO_SALA ps ON ps.id = ba.idPlanoSala
    WHERE ba.idFuncion = p_idFuncion
    ORDER BY ps.fila, ps.numero;
END$$

CREATE PROCEDURE get_asientos_por_funcion(IN p_idFuncion INT)
BEGIN
    SELECT ps.id AS idAsiento, ps.fila, ps.numero, ps.tipo, ps.disponible,
        CASE WHEN ba.id IS NULL THEN 'libre' ELSE 'ocupado' END AS estado,
        ba.idBoleta
    FROM PLANO_SALA ps
    LEFT JOIN BOLETA_ASIENTO ba ON ba.idPlanoSala = ps.id AND ba.idFuncion = p_idFuncion
    WHERE ps.idSala = (SELECT idSala FROM FUNCION WHERE id = p_idFuncion)
    ORDER BY ps.fila, ps.numero;
END$$

-- ===============================================================================================

-- Procedimientos para PROMO_BOLETA
CREATE PROCEDURE promo_boleta_add(
    IN p_idBoleta INT,
    IN p_idPromo INT,
    OUT p_id INT
)
BEGIN
    INSERT INTO PROMO_BOLETA(idBoleta,idPromo) VALUES (p_idBoleta,p_idPromo);
    SET p_id = LAST_INSERT_ID();
    CALL recalc_boleta_total(p_idBoleta);
END$$

CREATE PROCEDURE promo_boleta_remove(IN p_id INT)
BEGIN
    DECLARE v_idBoleta INT;
    SELECT idBoleta INTO v_idBoleta FROM PROMO_BOLETA WHERE id = p_id;
    DELETE FROM PROMO_BOLETA WHERE id = p_id;
    IF v_idBoleta IS NOT NULL THEN
        CALL recalc_boleta_total(v_idBoleta);
    END IF;
END$$

-- ===============================================================================================

-- Procedimientos para PROMO_USO
CREATE PROCEDURE promo_uso_create(
    IN p_idUsuario INT,
    IN p_idPromo INT,
    IN p_cantidad INT,
    IN p_fechaUso DATETIME,
    OUT p_id INT
)
BEGIN
    INSERT INTO PROMO_USO(idUsuario, idPromo, cantidad, fechaUso)
    VALUES (p_idUsuario, p_idPromo, p_cantidad, p_fechaUso);
    SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE promo_uso_get(IN p_id INT)
BEGIN
    SELECT * FROM PROMO_USO WHERE id = p_id;
END$$

CREATE PROCEDURE promo_uso_get_by_usuario(IN p_idUsuario INT)
BEGIN
    SELECT * FROM PROMO_USO WHERE idUsuario = p_idUsuario;
END$$

CREATE PROCEDURE promo_uso_get_by_promo(IN p_idPromo INT)
BEGIN
    SELECT * FROM PROMO_USO WHERE idPromo = p_idPromo;
END$$

CREATE PROCEDURE promo_uso_get_by_usuario_promo(IN p_idUsuario INT, IN p_idPromo INT)
BEGIN
    SELECT * FROM PROMO_USO WHERE idUsuario = p_idUsuario AND idPromo = p_idPromo LIMIT 1;
END$$

CREATE PROCEDURE promo_uso_update(
    IN p_id INT,
    IN p_cantidad INT,
    IN p_fechaUso DATETIME
)
BEGIN
    UPDATE PROMO_USO SET cantidad = p_cantidad, fechaUso = p_fechaUso WHERE id = p_id;
END$$

CREATE PROCEDURE promo_uso_delete(IN p_id INT)
BEGIN
    DELETE FROM PROMO_USO WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimientos para GENERO (get)
CREATE PROCEDURE genero_get(IN p_id INT)
BEGIN
    SELECT * FROM GENERO WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimientos para RESTRICCION (get)
CREATE PROCEDURE restriccion_get(IN p_id INT)
BEGIN
    SELECT * FROM RESTRICCION WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimiento para PROMO (get)
CREATE PROCEDURE promo_get(IN p_id INT)
BEGIN
    SELECT * FROM PROMO WHERE id = p_id;
END$$

-- ===============================================================================================

-- Procedimiento para información completa de función
CREATE PROCEDURE funcion_info_completa(IN p_idFuncion INT)
BEGIN
    SELECT
        f.id AS idFuncion, f.idSala, f.fecha, f.hora, f.idFormato, f.idIdioma,
        f.idPelicula, f.estado, f.precio,
        s.nombre AS nombreSala, c.nombre AS nombreCine,
        p.nombre AS nombrePelicula, p.portada AS portada,
        fo.nombre AS formato, i.nombre AS idioma
    FROM FUNCION f
    JOIN SALA s ON f.idSala = s.id
    JOIN CINE c ON s.idCine = c.id
    JOIN PELICULA p ON f.idPelicula = p.id
    JOIN FORMATO fo ON f.idFormato = fo.id
    LEFT JOIN IDIOMA i ON f.idIdioma = i.id
    WHERE f.id = p_idFuncion
    LIMIT 1;
END$$

-- ===============================================================================================

-- Índices recomendados para evitar problemas con sql_safe_updates

DELIMITER ;

ALTER TABLE PRODUCTOS_BOLETA ADD INDEX IF NOT EXISTS idx_productos_boleta_idBoleta (idBoleta);
ALTER TABLE BOLETA_ASIENTO ADD INDEX IF NOT EXISTS idx_boleta_asiento_idBoleta (idBoleta);
ALTER TABLE PROMO_BOLETA ADD INDEX IF NOT EXISTS idx_promo_boleta_idBoleta (idBoleta);

DELIMITER $$

-- ===============================================================================================

-- Triggers para recalcular totales de boleta automáticamente

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

DROP TRIGGER IF EXISTS trg_boleta_asiento_after_insert$$
CREATE TRIGGER trg_boleta_asiento_after_insert AFTER INSERT ON BOLETA_ASIENTO
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(NEW.idBoleta);
END$$

DROP TRIGGER IF EXISTS trg_boleta_asiento_after_update$$
CREATE TRIGGER trg_boleta_asiento_after_update AFTER UPDATE ON BOLETA_ASIENTO
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(NEW.idBoleta);
END$$

DROP TRIGGER IF EXISTS trg_boleta_asiento_after_delete$$
CREATE TRIGGER trg_boleta_asiento_after_delete AFTER DELETE ON BOLETA_ASIENTO
FOR EACH ROW
BEGIN
    CALL recalc_boleta_total(OLD.idBoleta);
END$$

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

-- ===============================================================================================

DELIMITER ;