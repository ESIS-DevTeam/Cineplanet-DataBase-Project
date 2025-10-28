document.addEventListener('DOMContentLoaded', async () => {
  // Géneros
  const selectGenero = document.getElementById('select-genero');
  if (selectGenero) {
    selectGenero.innerHTML = '<option value="">Cargando géneros...</option>';
    selectGenero.disabled = true;
    try {
      const res = await fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getGeneros.php');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const generos = await res.json();
      selectGenero.innerHTML = '<option value="">Todos</option>';
      generos.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id ?? '';
        opt.textContent = g.nombre ?? '';
        selectGenero.appendChild(opt);
      });
      selectGenero.disabled = false;
    } catch (err) {
      console.error('Error cargando géneros:', err);
      selectGenero.innerHTML = '<option value="">Error al cargar géneros</option>';
      selectGenero.disabled = true;
    }
  }

  // Idiomas
  function cargarIdiomas() {
    fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getIdiomas.php')
      .then(res => res.json())
      .then(data => {
        const select = document.getElementById('select-idioma');
        select.innerHTML = '';
        data.forEach(idioma => {
          const option = document.createElement('option');
          option.value = idioma.id;
          option.textContent = idioma.nombre;
          select.appendChild(option);
        });
      });
  }
  cargarIdiomas();

  // Formatos
  function cargarFormatos() {
    fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getFormatos.php')
      .then(res => res.json())
      .then(data => {
        const select = document.getElementById('select-formato');
        select.innerHTML = '';
        data.forEach(formato => {
          const option = document.createElement('option');
          option.value = formato.id;
          option.textContent = formato.nombre;
          select.appendChild(option);
        });
      });
  }
  cargarFormatos();

  // Censura (Restricciones)
  const selectCensura = document.getElementById('select-censura');
  if (selectCensura) {
    selectCensura.innerHTML = '<option value="">Cargando censura...</option>';
    selectCensura.disabled = true;
    try {
      const res = await fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getRestricciones.php');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const censuras = await res.json();
      selectCensura.innerHTML = '<option value="">Todos</option>';
      censuras.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id ?? '';
        opt.textContent = c.tipo ?? c.nombre ?? '';
        selectCensura.appendChild(opt);
      });
      selectCensura.disabled = false;
    } catch (err) {
      console.error('Error cargando censura:', err);
      selectCensura.innerHTML = '<option value="">Error al cargar censura</option>';
      selectCensura.disabled = true;
    }
  }
});
