async function cargarDatos(url, contenedorId, nombreCampo) {
  try {
    const response = await fetch(url);
    const datos = await response.json();

    const contenedor = document.getElementById(contenedorId);
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
});
