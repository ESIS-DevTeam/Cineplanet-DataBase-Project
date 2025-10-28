document.addEventListener('DOMContentLoaded', async () => {
  const selectCine = document.getElementById('select-cine');
  const selectCiudad = document.getElementById('select-ciudad');
  if (!selectCine) return;

  // estado inicial
  selectCine.innerHTML = '<option value="">Cargando cines...</option>';
  selectCine.disabled = true;

  let cines = [];

  async function loadCines() {
    try {
      const res = await fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getCines.php');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      cines = await res.json();
      renderCines();
    } catch (err) {
      console.error('Error cargando cines:', err);
      selectCine.innerHTML = '<option value="">Error al cargar cines</option>';
      selectCine.disabled = true;
    }
  }

  function renderCines() {
    const ciudadSel = selectCiudad ? (selectCiudad.value || '') : '';
    // filtrar cines si hay ciudad seleccionada
    let lista = cines;
    if (ciudadSel) {
      lista = cines.filter(c => {
        // comparar idCiudad (numérico) con el valor del select (string)
        if (c.idCiudad !== null && c.idCiudad !== undefined) {
          return String(c.idCiudad) === String(ciudadSel);
        }
        // fallback: comparar por nombre de ciudad si está disponible
        return (c.ciudadNombre && String(c.ciudadNombre) === String(ciudadSel));
      });
    }

    if (!Array.isArray(lista) || lista.length === 0) {
      selectCine.innerHTML = '<option value="">No hay cines disponibles</option>';
      selectCine.disabled = true;
      return;
    }

    // poblar select
    selectCine.innerHTML = '<option value="">Elige tu Cineplanet</option>';
    lista.forEach(c => {
      const opt = document.createElement('option');
      opt.className = 'filtro-select-option';
      opt.value = c.id ?? '';
      opt.textContent = c.nombre || c.name || `Cine ${opt.value}`;
      selectCine.appendChild(opt);
    });
    selectCine.disabled = false;
  }

  // si cambia la ciudad, re-renderizar
  if (selectCiudad) {
    selectCiudad.addEventListener('change', () => {
      renderCines();
    });
  }

  // cargar inicialmente
  await loadCines();
});

