document.addEventListener('DOMContentLoaded', async () => {
  // Formato
  const selectFormato = document.getElementById('select-formato');
  if (selectFormato) {
    selectFormato.innerHTML = '<option value="">Cargando formatos...</option>';
    selectFormato.disabled = true;
    try {
      const res = await fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getFormatos.php');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const formatos = await res.json();
      selectFormato.innerHTML = '<option value="">Selecciona formato</option>';
      formatos.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id || f.ID || '';
        opt.textContent = f.nombre || f.NOMBRE || '';
        selectFormato.appendChild(opt);
      });
      selectFormato.disabled = false;
    } catch (err) {
      selectFormato.innerHTML = '<option value="">Error al cargar formatos</option>';
      selectFormato.disabled = true;
    }
  }

  // Género
  const selectGenero = document.getElementById('select-genero');
  if (selectGenero) {
    selectGenero.innerHTML = '<option value="">Cargando géneros...</option>';
    selectGenero.disabled = true;
    try {
      const res = await fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getGeneros.php');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const generos = await res.json();
      selectGenero.innerHTML = '<option value="">Selecciona género</option>';
      generos.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id || g.ID || '';
        opt.textContent = g.nombre || g.NOMBRE || '';
        selectGenero.appendChild(opt);
      });
      selectGenero.disabled = false;
    } catch (err) {
      selectGenero.innerHTML = '<option value="">Error al cargar géneros</option>';
      selectGenero.disabled = true;
    }
  }

  // Idioma
  const selectIdioma = document.getElementById('select-idioma');
  if (selectIdioma) {
    selectIdioma.innerHTML = '<option value="">Cargando idiomas...</option>';
    selectIdioma.disabled = true;
    try {
      const res = await fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getIdiomas.php');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const idiomas = await res.json();
      selectIdioma.innerHTML = '<option value="">Selecciona idioma</option>';
      idiomas.forEach(i => {
        const opt = document.createElement('option');
        opt.value = i.id || i.ID || '';
        opt.textContent = i.nombre || i.NOMBRE || '';
        selectIdioma.appendChild(opt);
      });
      selectIdioma.disabled = false;
    } catch (err) {
      selectIdioma.innerHTML = '<option value="">Error al cargar idiomas</option>';
      selectIdioma.disabled = true;
    }
  }

  // Censura
  const selectCensura = document.getElementById('select-censura');
  if (selectCensura) {
    selectCensura.innerHTML = '<option value="">Cargando censuras...</option>';
    selectCensura.disabled = true;
    try {
      const res = await fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getRestricciones.php');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const censuras = await res.json();
      selectCensura.innerHTML = '<option value="">Selecciona censura</option>';
      censuras.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id || c.ID || c.Id || '';
        // Usar el campo 'tipo' para mostrar el nombre de la restricción
        opt.textContent = c.tipo || c.TIPO || c.Tipo || opt.value;
        selectCensura.appendChild(opt);
      });
      selectCensura.disabled = false;
    } catch (err) {
      selectCensura.innerHTML = '<option value="">Error al cargar censuras</option>';
      selectCensura.disabled = true;
    }
  }
});
