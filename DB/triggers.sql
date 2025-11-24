-- Trigger para actualizar puntos, visitas y rango de socio al insertar una boleta
DELIMITER //

CREATE TRIGGER tr_boleta_insert AFTER INSERT ON BOLETA
FOR EACH ROW
BEGIN
    DECLARE esSocio INT DEFAULT 0;
    DECLARE requierePuntosPromo INT DEFAULT 0;
    DECLARE puntosRestar INT DEFAULT 0;
    DECLARE puntosSumar INT DEFAULT 10;
    DECLARE visitasActuales INT DEFAULT 0;
    DECLARE nuevoGrado VARCHAR(10);

    -- Verifica si el usuario es socio
    SELECT COUNT(*) INTO esSocio FROM SOCIO WHERE id = NEW.idUsuario;

    IF esSocio > 0 THEN
        -- Verifica si la boleta tiene alguna promo que requiere puntos
        SELECT SUM(PROMO.requierePuntos) INTO requierePuntosPromo
        FROM PROMO_BOLETA
        JOIN PROMO ON PROMO_BOLETA.idPromo = PROMO.id
        WHERE PROMO_BOLETA.idBoleta = NEW.id;

        IF requierePuntosPromo > 0 THEN
            -- Restar puntos según la promo usada
            SELECT SUM(PROMO.puntosNecesarios) INTO puntosRestar
            FROM PROMO_BOLETA
            JOIN PROMO ON PROMO_BOLETA.idPromo = PROMO.id
            WHERE PROMO_BOLETA.idBoleta = NEW.id AND PROMO.requierePuntos = 1;

            -- Actualiza solo visitas (+1) y resta puntos
            UPDATE SOCIO SET
                visitas = visitas + 1,
                puntos = puntos - IFNULL(puntosRestar,0)
            WHERE id = NEW.idUsuario;
        ELSE
            -- Suma puntos (+10) y visitas (+1) solo una vez por boleta
            UPDATE SOCIO SET
                visitas = visitas + 1,
                puntos = puntos + puntosSumar
            WHERE id = NEW.idUsuario;
        END IF;

        -- Actualiza el grado según visitas
        SELECT visitas INTO visitasActuales FROM SOCIO WHERE id = NEW.idUsuario;
        IF visitasActuales >= 60 THEN
            SET nuevoGrado = 'black';
        ELSEIF visitasActuales >= 40 THEN
            SET nuevoGrado = 'oro';
        ELSEIF visitasActuales >= 20 THEN
            SET nuevoGrado = 'plata';
        ELSE
            SET nuevoGrado = 'clasico';
        END IF;
        UPDATE SOCIO SET grado = nuevoGrado WHERE id = NEW.idUsuario;
    END IF;
END;
//

-- Trigger para disminuir el stock de la promo si tiene stock y registrar el uso
CREATE TRIGGER tr_promo_boleta_insert AFTER INSERT ON PROMO_BOLETA
FOR EACH ROW
BEGIN
    DECLARE tieneStock INT DEFAULT 0;
    DECLARE stockActual INT DEFAULT 0;

    SELECT tieneStock, stock INTO tieneStock, stockActual FROM PROMO WHERE id = NEW.idPromo;

    IF tieneStock = 1 AND stockActual IS NOT NULL AND stockActual > 0 THEN
        UPDATE PROMO SET stock = stock - 1 WHERE id = NEW.idPromo;
    END IF;

    -- Registrar el uso de la promo
    INSERT INTO PROMO_USO (idUsuario, idPromo, cantidad, fechaUso)
    VALUES (
        (SELECT idUsuario FROM BOLETA WHERE id = NEW.idBoleta),
        NEW.idPromo,
        1,
        NOW()
    );
END;
//

DELIMITER ;

/*
Resumen de lógica implementada en los triggers:

- "Una vez por boleta" significa que, sin importar cuántos productos o promociones se compren en una sola boleta (compra), 
  los puntos y visitas solo se suman o restan una vez por esa transacción. 
  Es decir, no se suman puntos adicionales por cada producto o asiento, solo por la compra total (boleta).
- El rango de socio se actualiza automáticamente según el número de visitas:
    - 0-19 visitas: 'clasico'
    - 20-39 visitas: 'plata'
    - 40-59 visitas: 'oro'
    - 60+ visitas: 'black'
- El rango máximo ahora es "black" (a partir de 60 visitas).
*/
