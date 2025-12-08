import BASE_API_DOMAIN from './config.js';

const ciudadSelect = document.getElementById('ciudad-select');
const formatoSelect = document.getElementById('formato-select');
const cinesList = document.getElementById('cines-list');

function renderCines(cines) {
    cinesList.innerHTML = '';
    if (cines.length === 0) {
        cinesList.innerHTML = '<div>No hay cines disponibles para los filtros seleccionados.</div>';
        return;
    }
    cinesList.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:32px;">
            ${cines.map(cine => {
                const imgSrc = cine.imagen
                    ? '../images/portrait/cines/' + cine.imagen + '?v=' + Date.now()
                    : '../images/items/icono-cine.ico';
                return `
                <div class="cine-card" data-id="${cine.id}" style="cursor:pointer; background:#fff; border-radius:8px; box-shadow:0 2px 8px #0001; overflow:hidden;">
                    <img src="${imgSrc}" alt="${cine.nombre}" style="width:100%; height:160px; object-fit:cover;">
                    <div style="padding:16px;">
                        <div style="font-weight:bold; font-size:1.1em; margin-bottom:4px;">${cine.nombre}</div>
                        <div style="color:#333; margin-bottom:8px;">${cine.direccion}</div>
                        <div style="color:#555;">${cine.formatos ? cine.formatos.join(', ') : 'N/A'}</div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
    // Agregar evento click a cada tarjeta
    document.querySelectorAll('.cine-card').forEach(card => {
        card.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.location.href = `cineSeleccion.html?id=${id}`;
        });
    });
}

function cargarCiudades() {
    fetch(BASE_API_DOMAIN + 'cines/ciudades.php')
        .then(res => res.json())
        .then(data => {
            data.ciudades.forEach(ciudad => {
                const opt = document.createElement('option');
                opt.value = ciudad.id;
                opt.textContent = ciudad.nombre;
                ciudadSelect.appendChild(opt);
            });
        });
}

function cargarFormatos() {
    fetch(BASE_API_DOMAIN + 'cines/formatos.php')
        .then(res => res.json())
        .then(data => {
            data.formatos.forEach(formato => {
                const opt = document.createElement('option');
                opt.value = formato.id;
                opt.textContent = formato.nombre;
                formatoSelect.appendChild(opt);
            });
        });
}

function cargarCinesFiltrados() {
    const ciudad = ciudadSelect.value;
    const formato = formatoSelect.value;
    const params = new URLSearchParams();
    if (ciudad) params.append('ciudad', ciudad);
    if (formato) params.append('formato', formato);
    fetch(BASE_API_DOMAIN + 'cines/list.php?' + params.toString())
        .then(res => res.json())
        .then(data => renderCines(data.cines || []));
}

ciudadSelect.addEventListener('change', cargarCinesFiltrados);
formatoSelect.addEventListener('change', cargarCinesFiltrados);

cargarCiudades();
cargarFormatos();
cargarCinesFiltrados();
