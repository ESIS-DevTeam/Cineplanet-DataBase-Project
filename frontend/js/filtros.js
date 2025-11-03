let datosCines = [];
let datosCiudades = [];
let cineCiudadMap = {};
let datosPeliculas = [];
let datosGeneros = [];
let datosIdiomas = [];
let datosFormatos = [];
let datosCensura = [];

async function cargarDatos(url, contenedorId, nombreCampo) {
  try {
    const response = await fetch(url);
    const datos = await response.json();

    // Guardar datos originales y mapear relaciones
    if (nombreCampo === 'cine') {
      datosCines = datos;
      cineCiudadMap = {};
      datos.forEach(item => {
        cineCiudadMap[item.id] = item.idCiudad; // Relación cine-ciudad
      });
    }
    if (nombreCampo === 'ciudad') {
      datosCiudades = datos;
    }
    if (nombreCampo === 'pelicula') {
      datosPeliculas = datos;
    }
    if (nombreCampo === 'genero') {
      datosGeneros = datos;
    }
    if (nombreCampo === 'idioma') {
      datosIdiomas = datos;
    }
    if (nombreCampo === 'formato') {
      datosFormatos = datos;
    }
    if (nombreCampo === 'censura') {
      datosCensura = datos;
    }

    // Solo modificar el DOM si el contenedor existe
    if (contenedorId) {
      const contenedor = document.getElementById(contenedorId);
      if (contenedor) {
        contenedor.innerHTML = '';

        datos.forEach(item => {
          const label = document.createElement('label');
          label.style.display = 'block';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = nombreCampo;
          checkbox.value = item.id;
          if (nombreCampo === 'cine') {
            checkbox.setAttribute('data-ciudad-id', item.idCiudad); // Relación cine-ciudad
          }
          if (nombreCampo === 'ciudad') {
            checkbox.setAttribute('data-ciudad-id', item.id);
          }

          label.appendChild(checkbox);
          label.append(` ${item.nombre}`);
          contenedor.appendChild(label);
        });

        // Comportamiento de selección única para ciertos filtros
        if (nombreCampo !== 'idioma' && nombreCampo !== 'formato') {
          contenedor.addEventListener('change', e => {
            if (e.target.type === 'checkbox') {
              const checkboxes = contenedor.querySelectorAll('input[type="checkbox"]');

              if (e.target.checked) {
                checkboxes.forEach(chk => {
                  if (chk !== e.target) {
                    chk.parentElement.style.display = 'none';
                  }
                });
              } else {
                checkboxes.forEach(chk => {
                  chk.parentElement.style.display = 'block';
                });
              }
            }
          });
        }
      }
    }

  } catch (error) {
    console.error(`Error al cargar ${nombreCampo}:`, error);
  }
}

function sincronizarCinesConCiudad() {
  const contenedorCiudades = document.getElementById('contenedorCiudades');
  const contenedorCines = document.getElementById('contenedorCines');
  if (!contenedorCiudades || !contenedorCines) return;

  // Busca la ciudad seleccionada
  const ciudadSeleccionada = contenedorCiudades.querySelector('input[type="checkbox"]:checked');
  if (!ciudadSeleccionada) {
    // Si no hay ciudad seleccionada, muestra todos los cines
    contenedorCines.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.parentElement.style.display = 'block';
    });
    return;
  }
  const ciudadId = ciudadSeleccionada.value;
  contenedorCines.querySelectorAll('input[type="checkbox"]').forEach(chk => {
    if (chk.getAttribute('data-ciudad-id') !== ciudadId) {
      chk.parentElement.style.display = 'none';
      chk.checked = false;
    } else {
      chk.parentElement.style.display = 'block';
    }
  });
}

function procesarParametrosURL() {
  const params = new URLSearchParams(window.location.search);
  const filterMap = {
    'genero': 'contenedorGeneros',
    'idioma': 'contenedorIdiomas',
    'formato': 'contenedorFormato',
    'censura': 'contenedorCensura',
    'cine': 'contenedorCines',
    'ciudad': 'contenedorCiudades',
    'pelicula': 'contenedorPeliculas' // Asumiendo que tienes un contenedor para películas
  };

  let filtersApplied = false;

  for (const [key, value] of params.entries()) {
    const containerId = filterMap[key];
    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        const checkbox = container.querySelector(`input[type="checkbox"][value="${value}"]`);
        if (checkbox) {
          checkbox.checked = true;
          // Disparar evento para aplicar el filtro
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          filtersApplied = true;
        }
      }
    }
  }

  if (filtersApplied) {
    sincronizarCinesConCiudad(); // <-- sincroniza los cines con la ciudad seleccionada
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getCines.php', 'contenedorCines', 'cine'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getCiudades.php', 'contenedorCiudades', 'ciudad'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getGeneros.php', 'contenedorGeneros', 'genero'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getIdiomas.php', 'contenedorIdiomas', 'idioma'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getFormatos.php', 'contenedorFormato', 'formato'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getRestricciones.php', 'contenedorCensura', 'censura'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getPeliculas.php', '', 'pelicula') // Debes tener este endpoint
  ]);

  procesarParametrosURL();

  const filtroFecha = document.getElementById('filtro-fecha');
  if (filtroFecha) {
    filtroFecha.addEventListener('change', e => {
      if (e.target.type === 'checkbox') {
        const checkboxes = filtroFecha.querySelectorAll('input[type="checkbox"]');
        if (e.target.checked) {
          checkboxes.forEach(chk => {
            if (chk !== e.target) {
              chk.checked = false;
              chk.parentElement.style.display = 'none';
            }
          });
        } else {
          checkboxes.forEach(chk => {
            chk.parentElement.style.display = 'block';
          });
        }
      }
    });
  }

  const contenedorCiudades = document.getElementById('contenedorCiudades');
  const contenedorCines = document.getElementById('contenedorCines');

  // Listener para ciudades
  contenedorCiudades.addEventListener('change', e => {
    if (e.target.type === 'checkbox') {
      const ciudadId = e.target.value;
      const cinesCheckboxes = contenedorCines.querySelectorAll('input[type="checkbox"]');
      if (e.target.checked) {
        cinesCheckboxes.forEach(chk => {
          if (chk.getAttribute('data-ciudad-id') !== ciudadId) {
            chk.parentElement.style.display = 'none';
            chk.checked = false;
          } else {
            chk.parentElement.style.display = 'block';
          }
        });
      } else {
        cinesCheckboxes.forEach(chk => {
          chk.parentElement.style.display = 'block';
        });
      }
    }
  });

  // Listener para cines
  contenedorCines.addEventListener('change', e => {
    if (e.target.type === 'checkbox') {
      const cineId = e.target.value;
      const ciudadId = cineCiudadMap[cineId];
      const ciudadesCheckboxes = contenedorCiudades.querySelectorAll('input[type="checkbox"]');
      if (e.target.checked) {
        ciudadesCheckboxes.forEach(chk => {
          if (chk.value !== String(ciudadId)) {
            chk.parentElement.style.display = 'none';
            chk.checked = false;
          } else {
            chk.parentElement.style.display = 'block';
          }
        });
      } else {
        ciudadesCheckboxes.forEach(chk => {
          chk.parentElement.style.display = 'block';
        });
      }
    }
  });
});
