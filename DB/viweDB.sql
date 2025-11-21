-- ===============================================
-- VIEW: peliculas_filtro
-- Descripción: muestra toda la información necesaria
-- para filtrar películas en el frontend (peliculas.html)
-- ===============================================
DROP VIEW IF EXISTS peliculas_filtro;
CREATE OR REPLACE VIEW peliculas_filtro AS
SELECT
    f.id AS idFuncion,
    p.id AS idPelicula,
    p.nombre AS nombrePelicula,
    g.id AS idGenero,
    g.nombre AS genero,
    r.id AS idRestriccion,
    r.nombre AS restriccionEdad,
    p.restriccionComercial,
    p.sinopsis,
    p.autor,
    p.trailer,
    p.portada,
    p.duracion,
    p.estado AS estadoPelicula,
    f.fecha,
    f.hora,
    f.precio,
    f.estado AS estadoFuncion,
    (f.estado = 'preventa') AS esPreventa, -- <--- NUEVO: indica si es preventa
    f.idFormato,
    f.idIdioma,
    c.id AS idCine,
    c.nombre AS nombreCine,
    c.direccion AS direccionCine,
    ciu.id AS idCiudad,
    ciu.nombre AS ciudad,
    fo.nombre AS formato,
    i.nombre AS idioma,
    s.nombre AS sala,
    s.tipo AS tipoSala
FROM FUNCION f
INNER JOIN PELICULA p ON f.idPelicula = p.id
INNER JOIN GENERO g ON p.genero = g.id
INNER JOIN RESTRICCION r ON p.restriccion = r.id
INNER JOIN SALA s ON f.idSala = s.id
INNER JOIN CINE c ON s.idCine = c.id
INNER JOIN CIUDAD ciu ON c.idCiudad = ciu.id
INNER JOIN FORMATO fo ON f.idFormato = fo.id
INNER JOIN IDIOMA i ON f.idIdioma = i.id
WHERE (f.estado = 'activa' OR f.estado = 'preventa') AND p.estado = 'activa';



DROP VIEW IF EXISTS peliculas_funciones_activas;
CREATE OR REPLACE VIEW peliculas_funciones_activas AS
SELECT 
    p.id AS idPelicula,
    p.nombre AS nombrePelicula,
    g.nombre AS genero,
    r.nombre AS restriccion,
    f.id AS idFuncion,
    f.fecha,
    f.hora,
    f.precio,
    i.nombre AS idioma,
    fo.nombre AS formato,
    c.nombre AS cine,
    ci.nombre AS ciudad
FROM 
    PELICULA p
JOIN GENERO g ON p.genero = g.id
JOIN RESTRICCION r ON p.restriccion = r.id
JOIN FUNCION f ON f.idPelicula = p.id
JOIN SALA s ON f.idSala = s.id
JOIN CINE c ON s.idCine = c.id
LEFT JOIN CIUDAD ci ON c.idCiudad = ci.id
LEFT JOIN IDIOMA i ON f.idIdioma = i.id
LEFT JOIN FORMATO fo ON f.idFormato = fo.id
WHERE 
    f.estado = 'activa'
    AND p.estado = 'activa'
GROUP BY 
    p.id, f.id;
