-- Trigger para actualizar puntos, visitas y rango de socio al insertar una boleta
DELIMITER //

DROP TRIGGER IF EXISTS tr_boleta_insert;
//
CREATE TRIGGER tr_boleta_insert AFTER INSERT ON BOLETA
FOR EACH ROW
BEGIN
    -- La lógica de puntos/visitas/rango se mueve a PROMO_BOLETA
END;
//

-- Trigger para disminuir el stock de la promo, registrar el uso y actualizar puntos/visitas/rango
DELIMITER //

DROP TRIGGER IF EXISTS tr_promo_boleta_insert;
//
CREATE TRIGGER tr_promo_boleta_insert AFTER INSERT ON PROMO_BOLETA
FOR EACH ROW
BEGIN
    DECLARE tieneStock INT DEFAULT 0;
    DECLARE stockActual INT DEFAULT 0;
    DECLARE esSocio INT DEFAULT 0;
    DECLARE requierePuntosPromo INT DEFAULT 0;
    DECLARE puntosRestar INT DEFAULT 0;
    DECLARE puntosSumarBoleta INT DEFAULT 1;
    DECLARE visitasActuales INT DEFAULT 0;
    DECLARE nuevoGrado VARCHAR(10);
    DECLARE idUsuarioBoleta INT;

    -- Obtener el usuario de la boleta
    SELECT idUsuario INTO idUsuarioBoleta FROM BOLETA WHERE id = NEW.idBoleta;

    -- Disminuir stock si aplica
    SELECT tieneStock, stock INTO tieneStock, stockActual FROM PROMO WHERE id = NEW.idPromo;
    IF tieneStock = 1 AND stockActual IS NOT NULL AND stockActual > 0 THEN
        UPDATE PROMO SET stock = stock - 1 WHERE id = NEW.idPromo;
    END IF;

    -- Registrar el uso de la promo
    INSERT INTO PROMO_USO (idUsuario, idPromo, cantidad, fechaUso)
    VALUES (
        idUsuarioBoleta,
        NEW.idPromo,
        NEW.cantidad,
        NOW()
    );

    -- Ejecutar la lógica por cada inserción
    SELECT COUNT(*) INTO esSocio FROM SOCIO WHERE id = idUsuarioBoleta;
    IF esSocio > 0 THEN
        -- Verifica si la promo requiere puntos
        SELECT requierePuntos, puntosNecesarios INTO requierePuntosPromo, puntosRestar FROM PROMO WHERE id = NEW.idPromo;

        IF requierePuntosPromo > 0 THEN
            -- Restar puntos según la cantidad y puntos necesarios de la promo usada
            SET puntosRestar = puntosRestar * IFNULL(NEW.cantidad, 1);

            -- Suma visita (+1) y resta puntos por promo
            UPDATE SOCIO SET
                visitas = visitas + 1,
                puntos = puntos - IFNULL(puntosRestar,0)
            WHERE id = idUsuarioBoleta;
        ELSE
            -- Suma puntos por boleta (+1)
            UPDATE SOCIO SET
                visitas = visitas + 1,
                puntos = puntos + puntosSumarBoleta
            WHERE id = idUsuarioBoleta;
        END IF;

        -- Actualiza el grado según visitas
        SELECT visitas INTO visitasActuales FROM SOCIO WHERE id = idUsuarioBoleta;
        IF visitasActuales >= 60 THEN
            SET nuevoGrado = 'black';
        ELSEIF visitasActuales >= 40 THEN
            SET nuevoGrado = 'oro';
        ELSEIF visitasActuales >= 20 THEN
            SET nuevoGrado = 'plata';
        ELSE
            SET nuevoGrado = 'clasico';
        END IF;
        UPDATE SOCIO SET grado = nuevoGrado WHERE id = idUsuarioBoleta;
    END IF;
END;
//

-- Trigger para sumar puntos por productos al insertar en PRODUCTOS_BOLETA
DELIMITER //

DROP TRIGGER IF EXISTS tr_productos_boleta_insert;
//
CREATE TRIGGER tr_productos_boleta_insert AFTER INSERT ON PRODUCTOS_BOLETA
FOR EACH ROW
BEGIN
    DECLARE idUsuarioBoleta INT;
    DECLARE esSocio INT DEFAULT 0;
    DECLARE puntosProducto DECIMAL(10,2) DEFAULT 0;

    -- Obtener el usuario de la boleta
    SELECT idUsuario INTO idUsuarioBoleta FROM BOLETA WHERE id = NEW.idBoleta;

    -- Verificar si es socio
    SELECT COUNT(*) INTO esSocio FROM SOCIO WHERE id = idUsuarioBoleta;

    IF esSocio > 0 THEN
        -- Calcular puntos por producto (10% del precio * cantidad)
        SET puntosProducto = NEW.precioUnitario * NEW.cantidad * 0.10;

        -- Sumar puntos por producto
        UPDATE SOCIO SET
            puntos = puntos + puntosProducto
        WHERE id = idUsuarioBoleta;
    END IF;
END;
//

DELIMITER ;

/*
Resumen de lógica implementada en los triggers:

- Toda la lógica de puntos, visitas y rango de socio se ejecuta al insertar la primera promo en PROMO_BOLETA por boleta.
- "Una vez por boleta": los puntos y visitas solo se suman o restan una vez por esa transacción.
- El rango de socio se actualiza automáticamente según el número de visitas:
    - 0-19 visitas: 'clasico'
    - 20-39 visitas: 'plata'
    - 40-59 visitas: 'oro'
    - 60+ visitas: 'black'
- El rango máximo ahora es "black" (a partir de 60 visitas).
*/
