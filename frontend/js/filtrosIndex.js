import BASE_API_DOMAIN from "./config.js";
const API_URL = BASE_API_DOMAIN + 'getPeliculasFiltro.php';

const selects = {
  pelicula: document.getElementById('select-pelicula'),
  ciudad: document.getElementById('select-ciudad'),
  cine: document.getElementById('select-cine'),
  fecha: document.getElementById('select-fecha')
};

function limpiarSelect(select, placeholder) {
  select.innerHTML = '';
  const option = document.createElement('option');
  option.value = '';
  option.textContent = placeholder;
  select.appendChild(option);
}

function llenarSelectUnico(select, items, valueKey, textKey, selectedValue) {
  const usados = new Set();
  items.forEach(item => {
    if (!usados.has(item[valueKey])) {
      usados.add(item[valueKey]);
      const option = document.createElement('option');
      option.value = item[valueKey];
      option.textContent = item[textKey];
      if (selectedValue && selectedValue == item[valueKey]) option.selected = true;
      select.appendChild(option);
    }
  });
}

function llenarFechas(select, items, selectedValue) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechasUnicas = new Set();
  items.forEach(item => {
    const fechaFuncion = new Date(item.fecha + 'T00:00:00');
    if (fechaFuncion >= hoy) fechasUnicas.add(item.fecha);
  });
  const fechasOrdenadas = Array.from(fechasUnicas).sort();
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  fechasOrdenadas.forEach(fechaStr => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    const diaNumero = fecha.getDate();
    const nombreDia = diasSemana[fecha.getDay()];
    const esHoy = fecha.getTime() === hoy.getTime();
    let textoLabel = esHoy ? `Hoy ${nombreDia}` : `${nombreDia} ${diaNumero}`;
    const option = document.createElement('option');
    option.value = fechaStr;
    option.textContent = textoLabel;
    if (selectedValue && selectedValue == fechaStr) option.selected = true;
    select.appendChild(option);
  });
}

async function cargarYActualizarSelects(filtros = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, val]) => {
    if (val) params.append(key, val);
  });
  const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;
  const res = await fetch(url);
  const data = await res.json();

  limpiarSelect(selects.pelicula, 'Qué quieres ver');
  llenarSelectUnico(selects.pelicula, data, 'idPelicula', 'nombrePelicula', filtros.pelicula);

  limpiarSelect(selects.ciudad, 'Elige tu Ciudad');
  llenarSelectUnico(selects.ciudad, data, 'idCiudad', 'ciudad', filtros.ciudad);

  limpiarSelect(selects.cine, 'Elige tu Cineplanet');
  llenarSelectUnico(selects.cine, data, 'idCine', 'nombreCine', filtros.cine);

  limpiarSelect(selects.fecha, 'Elige un día');
  llenarFechas(selects.fecha, data, filtros.dia);
}

function actualizarBotonFiltrar() {
  const form = selects.pelicula.closest('form');
  if (!form) return;
  const btnFiltrar = form.querySelector('button[type="submit"]');
  if (!btnFiltrar) return;
  // Si todos los selects están en placeholder, deshabilitar
  const algunoSeleccionado = Object.values(selects).some(select => select.value);
  btnFiltrar.disabled = !algunoSeleccionado;
}

function habilitarSelects() {
  Object.values(selects).forEach(select => select.disabled = false);
}

document.addEventListener('DOMContentLoaded', async () => {
  habilitarSelects();

  let filtros = {
    pelicula: '',
    ciudad: '',
    cine: '',
    dia: ''
  };
  await cargarYActualizarSelects(filtros);
  actualizarBotonFiltrar();

  Object.entries(selects).forEach(([key, select]) => {
    select.addEventListener('change', async () => {
      filtros[key === 'fecha' ? 'dia' : key] = select.value;
      await cargarYActualizarSelects(filtros);
      // Mantener la selección actual si existe
      Object.entries(selects).forEach(([k, s]) => {
        const filtroKey = k === 'fecha' ? 'dia' : k;
        if (filtros[filtroKey]) s.value = filtros[filtroKey];
      });
      actualizarBotonFiltrar();
    });
  });

  // Evitar enviar placeholders y manejar rutas
  const form = selects.pelicula.closest('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const pelicula = selects.pelicula.value;
      const ciudad = selects.ciudad.value;
      const cine = selects.cine.value;
      const dia = selects.fecha.value;

      Object.values(selects).forEach(select => {
        if (!select.value) select.disabled = true;
        else select.disabled = false;
      });

      // Lógica de rutas
      if (pelicula && !ciudad && !cine && !dia) {
        window.location.href = `frontend/pages/peliculaSeleccion.html?pelicula=${encodeURIComponent(pelicula)}`;
      } else if (!pelicula && (ciudad || cine || dia)) {
        const params = [];
        if (ciudad) params.push(`ciudad=${encodeURIComponent(ciudad)}`);
        if (cine) params.push(`cine=${encodeURIComponent(cine)}`);
        if (dia) params.push(`dia=${encodeURIComponent(dia)}`);
        window.location.href = `frontend/pages/peliculas.html${params.length ? '?' + params.join('&') : ''}`;
      } else if (pelicula && (ciudad || cine || dia)) {
        const params = [`pelicula=${encodeURIComponent(pelicula)}`];
        if (ciudad) params.push(`ciudad=${encodeURIComponent(ciudad)}`);
        if (cine) params.push(`cine=${encodeURIComponent(cine)}`);
        if (dia) params.push(`dia=${encodeURIComponent(dia)}`);
        window.location.href = `frontend/pages/peliculaSeleccion.html?${params.join('&')}`;
      }
      // Si nada seleccionado, no hacer nada
    });
  }
});

// Habilitar selects también al volver atrás en el navegador
window.addEventListener('pageshow', habilitarSelects);
