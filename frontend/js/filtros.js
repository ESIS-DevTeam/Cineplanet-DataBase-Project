let datosCines = [];
let datosCiudades = [];
let cineCiudadMap = {};

async function cargarDatos(url, contenedorId, nombreCampo) {
  try {
    const response = await fetch(url);
    const datos = await response.json();

    // Guardar datos originales y mapear relaciones
    if (nombreCampo === 'cine') {
      datosCines = datos;
      cineCiudadMap = {};
      datos.forEach(item => {
        // Asume que el cine tiene un campo 'id' que representa la ciudad
        cineCiudadMap[item.id] = item.id; // <-- Aquí, el id del cine es igual al id de la ciudad
      });
    }
    if (nombreCampo === 'ciudad') {
      datosCiudades = datos;
    }

    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';

    datos.forEach(item => {
      const label = document.createElement('label');
      label.style.display = 'block';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = nombreCampo;
      checkbox.value = item.id;
      if (nombreCampo === 'cine') {
        checkbox.setAttribute('data-ciudad-id', item.id); // <-- Aquí también
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

  } catch (error) {
    console.error(`Error al cargar ${nombreCampo}:`, error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getCines.php', 'contenedorCines', 'cine');
  cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getCiudades.php', 'contenedorCiudades', 'ciudad');
  cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getGeneros.php', 'contenedorGeneros', 'genero');
  cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getIdiomas.php', 'contenedorIdiomas', 'idioma');
  cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getFormatos.php', 'contenedorFormato', 'formato');
  cargarDatos('http://localhost/Cineplanet-DataBase-Project/backend/api/getRestricciones.php', 'contenedorCensura', 'censura');

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
