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
let cinesFiltradosGlobal = [];
let funcionesPorCineGlobal = {}; // <-- nueva variable para guardar funciones

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

    // Pre-cargar funciones para todos los cines
    for (const cine of allCines) {
      const funcionesRes = await fetch(
        `http://localhost/Cineplanet-DataBase-Project/backend/api/getFuncionesPorCine.php?idPelicula=${idPelicula}&idCine=${cine.id}`
      );
      funcionesPorCineGlobal[cine.id] = await funcionesRes.json();
    }

    // Filtrar cines, ciudades y fechas para mostrar solo los que tienen funciones a partir de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const cinesConFuncionesFuturas = new Set();
    allCines.forEach(cine => {
      const funciones = funcionesPorCineGlobal[cine.id] || {};
      for (const fechaStr in funciones) {
        const fecha = new Date(fechaStr + 'T00:00:00');
        if (fecha >= hoy) {
          cinesConFuncionesFuturas.add(cine.id);
          break; // El cine tiene funciones futuras, no necesita seguir buscando
        }
      }
    });

    allCines = allCines.filter(cine => cinesConFuncionesFuturas.has(cine.id));
    
    const ciudadesConCinesActivos = new Set(allCines.map(cine => cine.idCiudad));
    allCiudades = allCiudades.filter(ciudad => ciudadesConCinesActivos.has(ciudad.id));

    allFechas = allFechas.filter(fechaStr => {
      const fecha = new Date(fechaStr + 'T00:00:00');
      return fecha >= hoy;
    }).sort();

    actualizarSelects();
    preseleccionarDesdeURL();
    renderDetallesCines();
  } catch (err) {
    console.error('Error al cargar opciones:', err);
  }
}

function preseleccionarDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  const selectCiudad = document.getElementById('select-ciudad-funcion');
  const selectCine = document.getElementById('select-cine-funcion');
  const selectFecha = document.getElementById('select-fecha-funcion');

  const ciudadURL = params.get('ciudad');
  const cineURL = params.get('cine');
  const diaURL = params.get('dia');

  // Preseleccionar ciudad
  if (ciudadURL) {
    selectCiudad.value = ciudadURL;
  }

  // Preseleccionar cine
  if (cineURL) {
    selectCine.value = cineURL;
  }

  // Preseleccionar fecha
  if (diaURL) {
    selectFecha.value = diaURL;
  }

  // Actualizar selects para reflejar los cambios
  actualizarSelects();
}

function obtenerFechasDisponiblesPorCines(cinesIds) {
  const fechasSet = new Set();
  cinesIds.forEach(cineId => {
    const funciones = funcionesPorCineGlobal[cineId] || {};
    Object.keys(funciones).forEach(fecha => {
      fechasSet.add(fecha);
    });
  });
  return Array.from(fechasSet).sort();
}

function obtenerCinesConFecha(fechas) {
  const cinesSet = new Set();
  allCines.forEach(cine => {
    const funciones = funcionesPorCineGlobal[cine.id] || {};
    fechas.forEach(fecha => {
      if (funciones[fecha]) {
        cinesSet.add(cine.id);
      }
    });
  });
  return cinesSet;
}

function obtenerCiudadesConFecha(fechas) {
  const ciudadesSet = new Set();
  const cinesConFecha = obtenerCinesConFecha(fechas);
  cinesConFecha.forEach(cineId => {
    const cine = allCines.find(c => c.id == cineId);
    if (cine) ciudadesSet.add(cine.idCiudad);
  });
  return ciudadesSet;
}

function actualizarSelects() {
  const selectCiudad = document.getElementById('select-ciudad-funcion');
  const selectCine = document.getElementById('select-cine-funcion');
  const selectFecha = document.getElementById('select-fecha-funcion');

  const ciudadSel = selectCiudad.value;
  const cineSel = selectCine.value;
  const fechaSel = selectFecha.value;

  // Determinar qué filtros aplicar
  let cinesFiltrados = allCines;
  let fechasFiltradas = allFechas;
  let ciudadesFiltradas = allCiudades;

  // Filtro 1: Por ciudad seleccionada
  if (ciudadSel) {
    cinesFiltrados = cinesFiltrados.filter(c => c.idCiudad == ciudadSel);
    fechasFiltradas = obtenerFechasDisponiblesPorCines(cinesFiltrados.map(c => c.id));
  }

  // Filtro 2: Por cine seleccionado (solo afecta ciudades y fechas, no a otros cines)
  if (cineSel) {
    const cine = allCines.find(c => c.id == cineSel);
    if (cine) {
      ciudadesFiltradas = allCiudades.filter(ci => ci.id == cine.idCiudad);
      fechasFiltradas = obtenerFechasDisponiblesPorCines([cine.id]);
    }
  }

  // Filtro 3: Por fecha seleccionada
  if (fechaSel) {
    const cinesConFecha = Array.from(obtenerCinesConFecha([fechaSel]));
    cinesFiltrados = cinesFiltrados.filter(c => cinesConFecha.includes(c.id));
    
    const ciudadesConFecha = Array.from(obtenerCiudadesConFecha([fechaSel]));
    ciudadesFiltradas = ciudadesFiltradas.filter(ci => ciudadesConFecha.includes(ci.id));
  }

  // Actualizar select de ciudades
  selectCiudad.innerHTML = '<option value="">Selecciona ciudad</option>';
  ciudadesFiltradas.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nombre;
    if (c.id == ciudadSel) opt.selected = true;
    selectCiudad.appendChild(opt);
  });

  // Actualizar select de cines
  selectCine.innerHTML = '<option value="">Selecciona cine</option>';
  cinesFiltrados.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nombre;
    if (c.id == cineSel) opt.selected = true;
    selectCine.appendChild(opt);
  });

  // Actualizar select de fechas
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

  // Guardar cines filtrados globalmente
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
    const ahora = new Date();
    const hoyStr = ahora.toISOString().split('T')[0];

    Object.entries(funcionesFiltradas).forEach(([fechaStr, funciones]) => {
      const esHoy = fechaStr === hoyStr;
      funciones.forEach(funcion => {
        if (esHoy) {
          const [hora, minuto] = funcion.hora.split(':');
          const horaFuncion = new Date();
          horaFuncion.setHours(hora, minuto, 0, 0);
          if (horaFuncion < ahora) {
            return; // Es hoy pero la hora ya pasó
          }
        }
        const key = `${funcion.formato} ${funcion.idioma}`;
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(funcion.hora);
      });
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

      horas.sort().forEach(hora => {
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
