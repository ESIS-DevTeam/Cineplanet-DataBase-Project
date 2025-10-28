document.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('select-ciudad');
  if (!select) return;

  // Mostrar placeholder mientras carga
  select.innerHTML = '<option value="">Cargando ciudades...</option>';
  select.disabled = true;

  try {
    const res = await fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getCiudades.php');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const ciudades = await res.json();

    // Opciones por defecto
    select.innerHTML = '<option value="">Selecciona una ciudad</option>';

    if (Array.isArray(ciudades) && ciudades.length) {
      ciudades.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id || c.ID || c.Id || '';
        opt.textContent = c.nombre || c.NOMBRE || c.name || '';
        select.appendChild(opt);
      });
      select.disabled = false;
    } else {
      select.innerHTML = '<option value="">No hay ciudades disponibles</option>';
      select.disabled = true;
    }
  } catch (err) {
    console.error('Error cargando ciudades:', err);
    select.innerHTML = '<option value="">Error al cargar ciudades</option>';
    select.disabled = true;
  }
});

