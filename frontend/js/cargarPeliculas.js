// frontend/js/peliculas.js
document.addEventListener("DOMContentLoaded", async () => {
  const selectPeliculas = document.querySelector("#select-pelicula");
  if (!selectPeliculas) return;

  // Mostrar placeholder mientras carga
  selectPeliculas.innerHTML = '<option class="filtro-select-option" value="">Cargando películas...</option>';
  selectPeliculas.disabled = true;

  try {
    const response = await fetch("http://localhost/Cineplanet-DataBase-Project/backend/api/getPeliculasConFuncion.php");
    if (!response.ok) throw new Error("Error al obtener las películas: " + response.status);

    const peliculas = await response.json();

    // Validar que sea un array
    if (!Array.isArray(peliculas) || peliculas.length === 0) {
      selectPeliculas.innerHTML = '<option class="filtro-select-option" value="">No hay películas disponibles</option>';
      selectPeliculas.disabled = true;
      console.warn('No se encontraron películas activas');
      return;
    }

    // No necesitas filtrar, ya que el endpoint solo devuelve películas con función activa
    const peliculasActivas = peliculas;

    if (peliculasActivas.length === 0) {
      selectPeliculas.innerHTML = '<option class="filtro-select-option" value="">No hay películas con funciones activas</option>';
      selectPeliculas.disabled = true;
      console.warn('No se encontraron películas con funciones activas');
      return;
    }

    // Limpia el select y agrega el placeholder
    selectPeliculas.innerHTML = '<option class="filtro-select-option" value="">Qué quieres ver</option>';

    // Recorre las películas activas y crea las opciones
    peliculasActivas.forEach(pelicula => {
      const option = document.createElement("option");
      option.classList.add("filtro-select-option");
      option.value = pelicula.id ?? pelicula.ID ?? '';
      option.textContent = pelicula.nombre;
      selectPeliculas.appendChild(option);
    });

    selectPeliculas.disabled = false;
    console.log("Películas cargadas correctamente:", peliculas);
  } catch (error) {
    console.error("Error al cargar las películas:", error);
    selectPeliculas.innerHTML = '<option class="filtro-select-option" value="">Error al cargar películas</option>';
    selectPeliculas.disabled = true;
  }
});
