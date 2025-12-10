-- Agregar campo frame a la tabla PELICULA
ALTER TABLE PELICULA ADD COLUMN frame VARCHAR(255) AFTER portada;

-- Actualizar algunas películas con frames de ejemplo (usando las imágenes que ya tienes)
UPDATE PELICULA SET frame = 'frontend/images/frames/4KOY11L2.jpg' WHERE nombre LIKE '%joker%' OR nombre LIKE '%Joker%';
UPDATE PELICULA SET frame = 'frontend/images/frames/BPB5UKZ0.jpg' WHERE nombre LIKE '%Last of Us%' OR nombre LIKE '%last of us%';
UPDATE PELICULA SET frame = 'frontend/images/frames/Barbie_23.jpg' WHERE nombre LIKE '%Barbie%' OR nombre LIKE '%barbie%';
