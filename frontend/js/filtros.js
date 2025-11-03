let datosCines = [];
let datosCiudades = [];
let datosPeliculas = [];
let datosGeneros = [];
let datosIdiomas = [];
let datosFormatos = [];
let datosCensura = [];
let datosFunciones = [];

function actualizarFiltroFechas() {
  const contenedorFecha = document.getElementById('filtro-fecha');
  if (!contenedorFecha) return;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechasUnicas = new Set();
  datosFunciones.forEach(funcion => {
    // MySQL devuelve 'YYYY-MM-DD'. Para evitar problemas de zona horaria, lo tratamos como UTC.
    const fechaFuncion = new Date(funcion.fecha + 'T00:00:00');
    if (fechaFuncion >= hoy) {
      fechasUnicas.add(funcion.fecha);
    }
  });

  const fechasOrdenadas = Array.from(fechasUnicas).sort();
  contenedorFecha.innerHTML = ''; // Limpiar contenido estático

  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  fechasOrdenadas.forEach(fechaStr => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    const diaNumero = fecha.getDate();
    const nombreDia = diasSemana[fecha.getDay()];
    
    let textoLabel;
    const esHoy = fecha.getTime() === hoy.getTime();

    if (esHoy) {
      textoLabel = `hoy ${nombreDia}`;
    } else {
      textoLabel = `${nombreDia} ${diaNumero}`;
    }

    const label = document.createElement('label');
    label.style.display = 'block';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'dia';
    checkbox.value = fechaStr;

    label.appendChild(checkbox);
    label.append(` ${textoLabel}`);
    contenedorFecha.appendChild(label);
  });

  // El comportamiento de selección única se ha movido a peliculasFiltradas.js
  // para centralizar la lógica de los filtros.
}

function actualizarCines(ciudadId) {
  const contenedorCines = document.getElementById('contenedorCines');
  if (!contenedorCines) return;

  const cinesAMostrar = ciudadId
    ? datosCines.filter(cine => cine.idCiudad == ciudadId)
    : datosCines;

  const idsCinesAMostrar = cinesAMostrar.map(cine => cine.id);

  const checkboxesCines = contenedorCines.querySelectorAll('input[type="checkbox"]');
  checkboxesCines.forEach(chk => {
    // Desmarcar todos los cines al cambiar la ciudad
    chk.checked = false;
    const cineId = chk.value;
    if (idsCinesAMostrar.includes(cineId)) {
      chk.parentElement.style.display = 'block';
    } else {
      chk.parentElement.style.display = 'none';
    }
  });
}

async function cargarDatos(url, contenedorId, nombreCampo) {
  try {
    const response = await fetch(url);
    const datos = await response.json();

    // Guardar datos originales y mapear relaciones
    if (nombreCampo === 'cine') {
      datosCines = datos;
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
    if (nombreCampo === 'funcion') {
      datosFunciones = datos;
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

          label.appendChild(checkbox);
          label.append(` ${item.nombre}`);
          contenedor.appendChild(label);
        });

        // Comportamiento de selección única para ciertos filtros
        if (nombreCampo === 'cine' || nombreCampo === 'ciudad') {
          contenedor.addEventListener('change', e => {
            if (e.target.type === 'checkbox') {
              const checkboxes = contenedor.querySelectorAll('input[type="checkbox"]');

              if (e.target.checked) {
                checkboxes.forEach(chk => {
                  if (chk !== e.target) {
                    chk.parentElement.style.display = 'none';
                  }
                });
                if (nombreCampo === 'ciudad') {
                  actualizarCines(e.target.value);
                } else if (nombreCampo === 'cine') {
                  // Mostrar solo la ciudad correspondiente y deshabilitarla
                  const cineSeleccionado = datosCines.find(cine => cine.id == e.target.value);
                  if (cineSeleccionado) {
                    const ciudadCheckboxes = document.querySelectorAll('#contenedorCiudades input[type="checkbox"]');
                    ciudadCheckboxes.forEach(chk => {
                      if (chk.value == cineSeleccionado.idCiudad) {
                        chk.checked = true;
                        chk.disabled = true;
                        chk.parentElement.style.display = 'block';
                      } else {
                        chk.checked = false;
                        chk.parentElement.style.display = 'none';
                      }
                    });
                  }
                }
              } else {
                if (nombreCampo === 'ciudad') {
                  checkboxes.forEach(chk => {
                    chk.parentElement.style.display = 'block';
                  });
                  actualizarCines(null); // Mostrar todos los cines
                } else if (nombreCampo === 'cine') {
                  // Si se desmarca un cine, restaurar el filtro de ciudades
                  const ciudadCheckboxes = document.querySelectorAll('#contenedorCiudades input[type="checkbox"]');
                  ciudadCheckboxes.forEach(chk => {
                    chk.checked = false;
                    chk.disabled = false;
                    chk.parentElement.style.display = 'block';
                  });
                  // Y mostrar todos los cines
                  actualizarCines(null);
                }
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

function procesarParametrosURL() {
  const params = new URLSearchParams(window.location.search);
  const filterMap = {
    'genero': 'contenedorGeneros',
    'idioma': 'contenedorIdiomas',
    'formato': 'contenedorFormato',
    'censura': 'contenedorCensura',
    'cine': 'contenedorCines',
    'ciudad': 'contenedorCiudades',
    'dia': 'filtro-fecha', // <-- Añadir esta línea
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
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getCines.php', 'contenedorCines', 'cine'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getCiudades.php', 'contenedorCiudades', 'ciudad'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getGeneros.php', 'contenedorGeneros', 'genero'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getIdiomas.php', 'contenedorIdiomas', 'idioma'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getFormatos.php', 'contenedorFormato', 'formato'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getRestricciones.php', 'contenedorCensura', 'censura'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getPeliculas.php', '', 'pelicula'),
    cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getFunciones.php', '', 'funcion')
  ]);

  // Una vez cargados todos los datos, asociar funciones a películas
  datosPeliculas.forEach(pelicula => {
    pelicula.funciones = datosFunciones.filter(funcion => funcion.idPelicula == pelicula.id);
  });

  actualizarFiltroFechas();
  procesarParametrosURL();

  const filtroFecha = document.getElementById('filtro-fecha');
  if (filtroFecha) {
    // SE ELIMINA ESTE BLOQUE PARA EVITAR CONFLICTOS
  }
});
