import BASE_API_DOMAIN from "./config.js";

const selectCiudad = document.getElementById('select-ciudad');
const selectCine = document.getElementById('select-cine');
const form = document.getElementById('form-ciudad-cine');

async function cargarCiudades() {
    try {
        const res = await fetch(BASE_API_DOMAIN + 'getCiudades.php');
        const ciudades = await res.json();
        selectCiudad.innerHTML = '<option value="">Selecciona una ciudad</option>';
        ciudades.forEach(ciudad => {
            const opt = document.createElement('option');
            opt.value = ciudad.id;
            opt.textContent = ciudad.nombre;
            selectCiudad.appendChild(opt);
        });
    } catch {
        selectCiudad.innerHTML = '<option value="">Error al cargar ciudades</option>';
    }
}

async function cargarCines(idCiudad) {
    selectCine.innerHTML = '<option value="">Selecciona un cine</option>';
    selectCine.disabled = true;
    if (!idCiudad) return;
    try {
        const res = await fetch(BASE_API_DOMAIN + `getCinesPorCiudad.php?idCiudad=${idCiudad}`);
        const cines = await res.json();
        cines.forEach(cine => {
            const opt = document.createElement('option');
            opt.value = cine.id;
            opt.textContent = cine.nombre;
            selectCine.appendChild(opt);
        });
        selectCine.disabled = false;
    } catch {
        selectCine.innerHTML = '<option value="">Error al cargar cines</option>';
        selectCine.disabled = true;
    }
}

selectCiudad.addEventListener('change', e => {
    cargarCines(e.target.value);
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const ciudadId = selectCiudad.value;
    const cineId = selectCine.value;
    if (!ciudadId || !cineId) {
        alert('Selecciona una ciudad y un cine.');
        return;
    }
    // Redirige o realiza la acción deseada
    alert(`Ciudad seleccionada: ${ciudadId}, Cine seleccionado: ${cineId}`);
    // window.location.href = `...?ciudad=${ciudadId}&cine=${cineId}`;
});

cargarCiudades();
