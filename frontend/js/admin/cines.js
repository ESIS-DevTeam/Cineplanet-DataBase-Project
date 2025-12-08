import BASE_API_DOMAIN from '../config.js';

const API = BASE_API_DOMAIN + 'admin/cines/';

export async function cargarCines() {
    const tbody = document.querySelector('#cinesTable tbody');
    const emptyState = document.getElementById('emptyStateCines');
    tbody.innerHTML = '';
    emptyState.style.display = 'none';

    try {
        const res = await fetch(API + 'listar.php');
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        if (json.data.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        json.data.forEach(cine => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cine.id}</td>
                <td>${cine.nombre}</td>
                <td>${cine.direccion}</td>
                <td>${cine.telefono}</td>
                <td>${cine.email}</td>
                <td>${cine.ciudad || ''}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="window.editarCine(${cine.id})">Editar</button>
                        <button class="btn-delete" onclick="window.eliminarCine(${cine.id})">Eliminar</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        window.mostrarAlerta('❌ Error al cargar cines', 'error');
    }
}

export async function inicializarCines() {
    // Cargar ciudades en el select
    try {
        const res = await fetch(BASE_API_DOMAIN + 'admin/ciudades/listar.php');
        const json = await res.json();
        const select = document.getElementById('cineCiudad');
        if (!select) return;
        select.innerHTML = '<option value="">Seleccione ciudad...</option>';
        if (json.success && Array.isArray(json.data)) {
            json.data.forEach(ciudad => {
                const opt = document.createElement('option');
                opt.value = ciudad.id;
                opt.textContent = ciudad.nombre;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        // No mostrar alerta aquí, solo dejar el select vacío
    }

    // Form submit
    const form = document.getElementById('formCine');
    if (form) {
        form.onsubmit = async function(e) {
            e.preventDefault();
            const id = form.cineId.value;
            const formData = new FormData();
            formData.append('nombre', form.cineNombre.value);
            formData.append('direccion', form.cineDireccion.value);
            formData.append('telefono', form.cineTelefono.value);
            formData.append('email', form.cineEmail.value);
            formData.append('idCiudad', form.cineCiudad.value || '');
            if (id) formData.append('id', id);

            // Imagen (archivo)
            const imagenInput = document.getElementById('cineImagenArchivo');
            if (imagenInput && imagenInput.files && imagenInput.files[0]) {
                formData.append('imagen', imagenInput.files[0]);
            }

            try {
                const res = await fetch(API + (id ? 'actualizar.php' : 'crear.php'), {
                    method: 'POST',
                    body: formData
                });
                const json = await res.json();
                if (!json.success) throw new Error(json.message);
                window.mostrarAlerta('✅ Cine guardado correctamente', 'success');
                form.reset();
                form.cineId.value = '';
                document.getElementById('cineImagenNombre').textContent = '';
                cargarCines();
            } catch (err) {
                window.mostrarAlerta('❌ Error al guardar cine', 'error');
            }
        };

        form.onreset = function() {
            form.cineId.value = '';
            document.getElementById('cineImagenNombre').textContent = '';
        };
    }
}

export async function editarCine(id) {
    try {
        const res = await fetch(API + 'obtener.php?id=' + id);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        const cine = json.data;
        const form = document.getElementById('formCine');
        if (!form) return;
        form.cineId.value = cine.id;
        form.cineNombre.value = cine.nombre;
        form.cineDireccion.value = cine.direccion;
        form.cineTelefono.value = cine.telefono;
        form.cineEmail.value = cine.email;
        form.cineCiudad.value = cine.idCiudad || '';
        // Mostrar nombre de imagen actual si existe
        const imagenNombreDiv = document.getElementById('cineImagenNombre');
        if (imagenNombreDiv) imagenNombreDiv.textContent = cine.imagen ? `Imagen actual: ${cine.imagen}` : '';
        // Limpiar el input file (no se puede setear value por seguridad)
        document.getElementById('cineImagenArchivo').value = '';
        window.mostrarAlerta('✏️ Editando cine', 'success');
    } catch (err) {
        window.mostrarAlerta('❌ Error al cargar cine', 'error');
    }
}

export async function eliminarCine(id) {
    if (!confirm('¿Seguro que desea eliminar este cine?')) return;
    try {
        const res = await fetch(API + 'eliminar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        window.mostrarAlerta('🗑️ Cine eliminado correctamente', 'success');
        cargarCines();
    } catch (err) {
        window.mostrarAlerta('❌ Error al eliminar cine', 'error');
    }
}

export function guardarCine() {
    // La lógica de guardar está en el submit del formulario
}
