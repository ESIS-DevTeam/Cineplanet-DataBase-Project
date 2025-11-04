async function mostrarInfoPelicula() {
  const params = new URLSearchParams(window.location.search);
  const idPelicula = params.get('pelicula');
  const ciudad = params.get('ciudad');
  const cine = params.get('cine');
  const dia = params.get('dia');
  const infoDiv = document.getElementById('info-pelicula');

  if (!idPelicula) {
    infoDiv.textContent = 'No se ha seleccionado ninguna película.';
    return;
  }

  try {
    // Usar el endpoint nuevo para obtener los datos por id
    const res = await fetch(`http://localhost/Cineplanet-DataBase-Project/backend/api/getInfoPelicula.php?idPelicula=${idPelicula}`);
    const pelicula = await res.json();

    if (!pelicula || Object.keys(pelicula).length === 0) {
      infoDiv.textContent = 'Película no encontrada.';
      return;
    }

    // Idiomas y formatos pueden venir como string o array, normalizar
    let idiomas = pelicula.idiomas || pelicula.idioma || '';
    if (Array.isArray(idiomas)) idiomas = idiomas.join(', ');
    let formatos = pelicula.formatos || pelicula.formato || '';
    if (Array.isArray(formatos)) formatos = formatos.join(', ');

    let trailerHtml = '';
    if (pelicula.trailer) {
      // Extraer el ID de YouTube desde el link completo
      let youtubeId = '';
      // Admite formatos: https://www.youtube.com/watch?v=xxxx, https://youtu.be/xxxx, etc.
      const ytMatch = pelicula.trailer.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      if (ytMatch) {
        youtubeId = ytMatch[1];
      }
      if (youtubeId) {
        trailerHtml = `
          <div style="margin:1em 0;">
            <iframe src="https://www.youtube.com/embed/${youtubeId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>
          </div>
        `;
      } else {
        // Si no es YouTube, solo muestra el link
        trailerHtml = `
          <div style="margin:1em 0;">
            <a href="${pelicula.trailer}" target="_blank">${pelicula.trailer}</a>
          </div>
        `;
      }
    }

    infoDiv.innerHTML = `
      ${trailerHtml}
      <h2>${pelicula.nombrePelicula || pelicula.nombre || 'Sin título'}</h2>
      ${pelicula.portada ? `<img src="${pelicula.portada}" alt="Portada" style="max-width:200px;">` : ''}
      <p><strong>Sinopsis:</strong> ${pelicula.sinopsis || ''}</p>
      <p><strong>Género:</strong> ${pelicula.genero || pelicula.generoPelicula || ''}</p>
      <p><strong>Duración:</strong> ${pelicula.duracion || ''} min</p>
      <p><strong>Clasificación:</strong> ${pelicula.restriccionEdad || pelicula.clasificacion || ''}</p>
      <p><strong>Idiomas disponibles:</strong> ${idiomas}</p>
      <p><strong>Formatos disponibles:</strong> ${formatos}</p>
      ${ciudad ? `<p><strong>Ciudad:</strong> ${ciudad}</p>` : ''}
      ${cine ? `<p><strong>Cine:</strong> ${cine}</p>` : ''}
      ${dia ? `<p><strong>Fecha:</strong> ${dia}</p>` : ''}
    `;
  } catch (err) {
    infoDiv.textContent = 'Error al cargar la película.';
  }
}

let allCines = [];
let allCiudades = [];
let allFechas = [];
let rawData = null;
let cinesFiltradosGlobal = []; // <-- variable global para los cines filtrados

async function cargarOpcionesFuncionPelicula() {
  const params = new URLSearchParams(window.location.search);
  const idPelicula = params.get('pelicula');
  if (!idPelicula) return;

  try {
    const res = await fetch(`http://localhost/Cineplanet-DataBase-Project/backend/api/getOpcionesFuncionPelicula.php?pelicula=${idPelicula}`);
    const data = await res.json();
    rawData = data;

    allCiudades = data.ciudades;
    allCines = data.cines;
    allFechas = data.fechas;

    actualizarSelects();
    renderDetallesCines();
  } catch (err) {
    // Opcional: mostrar error en los selects
  }
}

function actualizarSelects() {
  const selectCiudad = document.getElementById('select-ciudad-funcion');
  const selectCine = document.getElementById('select-cine-funcion');
  const selectFecha = document.getElementById('select-fecha-funcion');

  const ciudadSel = selectCiudad.value;
  const cineSel = selectCine.value;
  const fechaSel = selectFecha.value;

  // Filtrar cines por ciudad seleccionada
  let cinesFiltrados = allCines;
  if (ciudadSel) {
    cinesFiltrados = cinesFiltrados.filter(c => c.idCiudad == ciudadSel);
  }
  // Filtrar cines por cine seleccionado
  if (cineSel) {
    cinesFiltrados = cinesFiltrados.filter(c => c.id == cineSel);
  }

  // Filtrar fechas según los cines filtrados
  let fechasFiltradas = [];
  cinesFiltrados.forEach(cine => {
    // Buscar fechas en las funciones de ese cine
    if (rawData.fechas && Array.isArray(rawData.fechas)) {
      rawData.fechas.forEach(fecha => {
        // Si el cine tiene esa fecha, agregarla
        fechasFiltradas.push(fecha);
      });
    }
  });
  // Eliminar duplicados
  fechasFiltradas = Array.from(new Set(fechasFiltradas));

  // Filtrar ciudades por cine seleccionado
  let ciudadesFiltradas = allCiudades;
  if (cineSel) {
    const cineObj = allCines.find(c => c.id == cineSel);
    if (cineObj) {
      ciudadesFiltradas = allCiudades.filter(ci => ci.id == cineObj.idCiudad);
    }
  }

  // Actualizar selects
  selectCiudad.innerHTML = '<option value="">Selecciona ciudad</option>';
  ciudadesFiltradas.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nombre;
    if (c.id == ciudadSel) opt.selected = true;
    selectCiudad.appendChild(opt);
  });

  selectCine.innerHTML = '<option value="">Selecciona cine</option>';
  cinesFiltrados.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nombre;
    if (c.id == cineSel) opt.selected = true;
    selectCine.appendChild(opt);
  });

  // Filtrar fechas desde hoy en adelante y mostrar nombre del día
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  const fechasOrdenadas = fechasFiltradas
    .filter(fechaStr => {
      const fecha = new Date(fechaStr + 'T00:00:00');
      return fecha >= hoy;
    })
    .sort();

  selectFecha.innerHTML = '<option value="">Selecciona fecha</option>';
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

    const opt = document.createElement('option');
    opt.value = fechaStr;
    opt.textContent = textoLabel;
    if (fechaStr == fechaSel) opt.selected = true;
    selectFecha.appendChild(opt);
  });

  // Al final de la función, guarda los cines filtrados globalmente
  cinesFiltradosGlobal = cinesFiltrados;
}

async function renderDetallesCines() {
  const idPelicula = new URLSearchParams(window.location.search).get('pelicula');
  const selectCiudad = document.getElementById('select-ciudad-funcion');
  const selectCine = document.getElementById('select-cine-funcion');
  const selectFecha = document.getElementById('select-fecha-funcion');
  const cinesContainer = document.getElementById('cines-details-container');

  // Usa los cines filtrados globalmente
  let cinesFiltrados = cinesFiltradosGlobal || [];
  const ciudadSeleccionada = selectCiudad.value;
  const cineSeleccionado = selectCine.value;
  const fechaSeleccionada = selectFecha.value;

  if (ciudadSeleccionada) {
    cinesFiltrados = cinesFiltrados.filter(c => c.idCiudad == ciudadSeleccionada);
  }
  if (cineSeleccionado) {
    cinesFiltrados = cinesFiltrados.filter(c => c.id == cineSeleccionado);
  }

  cinesContainer.innerHTML = '';
  for (const c of cinesFiltrados) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = c.nombre;
    details.appendChild(summary);

    // Obtener funciones por cine usando el endpoint
    const funcionesRes = await fetch(
      `http://localhost/Cineplanet-DataBase-Project/backend/api/getFuncionesPorCine.php?idPelicula=${idPelicula}&idCine=${c.id}`
    );
    const funcionesPorFecha = await funcionesRes.json();

    // Si hay filtro de fecha, solo mostrar funciones de esa fecha
    let funcionesFiltradas = funcionesPorFecha;
    if (fechaSeleccionada) {
      funcionesFiltradas = {};
      if (funcionesPorFecha[fechaSeleccionada]) {
        funcionesFiltradas[fechaSeleccionada] = funcionesPorFecha[fechaSeleccionada];
      }
    }

    // Agrupar por formato+idioma
    const grupos = {};
    Object.values(funcionesFiltradas).flat().forEach(funcion => {
      const key = `${funcion.formato} ${funcion.idioma}`;
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(funcion.hora);
    });

    // Si no hay funciones, no mostrar el cine
    if (Object.keys(grupos).length === 0) continue;

    Object.entries(grupos).forEach(([titulo, horas]) => {
      const divGrupo = document.createElement('div');
      divGrupo.style.marginBottom = '1em';
      const tituloDiv = document.createElement('div');
      tituloDiv.textContent = titulo;
      tituloDiv.style.fontWeight = 'bold';
      divGrupo.appendChild(tituloDiv);

      horas.forEach(hora => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = hora;
        btn.style.marginRight = '0.5em';
        divGrupo.appendChild(btn);
      });

      details.appendChild(divGrupo);
    });

    cinesContainer.appendChild(details);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  mostrarInfoPelicula();
  cargarOpcionesFuncionPelicula();

  document.getElementById('select-ciudad-funcion').addEventListener('change', () => {
    actualizarSelects();
    renderDetallesCines();
  });
  document.getElementById('select-cine-funcion').addEventListener('change', () => {
    actualizarSelects();
    renderDetallesCines();
  });
  document.getElementById('select-fecha-funcion').addEventListener('change', () => {
    actualizarSelects();
    renderDetallesCines();
  });
});
