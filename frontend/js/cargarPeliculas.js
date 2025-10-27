// frontend/js/peliculas.js
document.addEventListener("DOMContentLoaded", async () => {
  const selectPeliculas = document.querySelector("#select-pelicula");

  try {
    // 👇 Cambia esta ruta si tu estructura tiene otro nombre
    const response = await fetch("http://localhost/Cineplanet-DataBase-Project/backend/api/getPeliculas.php");
    
    // Verifica si el servidor respondió correctamente
    if (!response.ok) throw new Error("Error al obtener las películas");
    
    const peliculas = await response.json();

    // Limpia el select y agrega el placeholder
    selectPeliculas.innerHTML = '<option class="filtro-select-option" value="">Qué quieres ver</option>';

    // Recorre las películas activas y crea las opciones
    peliculas.forEach(pelicula => {
      const option = document.createElement("option");
      option.classList.add("filtro-select-option");
      option.value = pelicula.id; // puedes usar id o nombre si prefieres
      option.textContent = pelicula.nombre; // mostrar solo el nombre
      selectPeliculas.appendChild(option);
    });

    console.log("Películas cargadas correctamente:", peliculas);
  } catch (error) {
    console.error("Error al cargar las películas:", error);
    selectPeliculas.innerHTML = '<option value="">Error al cargar películas</option>';
  }
});
