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
    g.nombre AS genero,
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
WHERE f.estado = 'activa' AND p.estado = 'activa';
