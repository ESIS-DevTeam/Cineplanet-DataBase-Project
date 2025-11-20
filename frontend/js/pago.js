import BASE_API_DOMAIN from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idFuncion = params.get('funcion');
    const idPelicula = params.get('pelicula');
    const asientos = params.get('asientos');
    const promos = params.get('promos');
    const productos = params.get('productos');

    // Verifica sesión para mostrar el ícono de socio
    let sessionData = {};
    try {
        const sessionRes = await fetch('../../backend/auth/checkSession.php');
        sessionData = await sessionRes.json();
        const socioDisplay = document.getElementById('socio-display');
        if (sessionData.socio && sessionData.socio.nombre) {
            const nombre = sessionData.socio.nombre;
            const iniciales = nombre.split(' ').map(word => word[0]).join('').toUpperCase();
            socioDisplay.textContent = iniciales;
        } else {
            socioDisplay.textContent = '👤';
        }
    } catch (error) {
        document.getElementById('socio-display').textContent = '👤';
    }

    // Obtener datos de función y película
    let infoFuncion = null;
    if (idFuncion) {
        try {
            const resInfo = await fetch(BASE_API_DOMAIN + `getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
            infoFuncion = await resInfo.json();
        } catch {
            document.getElementById('info-container').textContent = 'Error al obtener la información de la función.';
        }
    }

    // Renderiza la info de función y película
    const infoContainer = document.getElementById('info-container');
    if (infoFuncion) {
        let fechaTexto = '';
        if (infoFuncion.fecha) {
            const fechaObj = new Date(infoFuncion.fecha + 'T00:00:00');
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fechaObj.getTime() === hoy.getTime()) {
                fechaTexto = `Hoy, ${fechaObj.getDate()} de ${fechaObj.toLocaleString('es-ES', { month: 'short' })} de ${fechaObj.getFullYear()}`;
            } else {
                const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                fechaTexto = `${diasSemana[fechaObj.getDay()]}, ${fechaObj.getDate()} de ${fechaObj.toLocaleString('es-ES', { month: 'short' })} de ${fechaObj.getFullYear()}`;
            }
        }
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <div style="text-align:center;">
                ${infoFuncion.portada ? `<img src="${infoFuncion.portada}" alt="Portada" style="width:140px;height:140px;border-radius:50%;object-fit:cover;">` : ''}
            </div>
            <h2 style="font-weight:bold; margin:0.5em 0;">${infoFuncion.nombrePelicula || ''}</h2>
            <div style="margin-bottom:0.5em;">${infoFuncion.formato || ''}${infoFuncion.formato && infoFuncion.idioma ? ', ' : ''}${infoFuncion.idioma || ''}</div>
            <div style="font-weight:bold; margin-bottom:0.5em;">${infoFuncion.nombreCine || ''}</div>
            <div style="margin-bottom:0.3em;">
                <span>📅 ${fechaTexto}</span>
            </div>
            <div style="margin-bottom:0.3em;">
                <span>🕒 ${infoFuncion.hora || ''}</span>
            </div>
            <div>
                <span>🏢 ${infoFuncion.nombreSala || ''}</span>
            </div>
            <hr style="margin:1em 0;">
        `;
        infoContainer.appendChild(infoDiv);
    }

    // Mostrar resumen de compra y total
    // Crea el modal si no existe
    let resumenModal = document.getElementById('resumen-modal');
    if (!resumenModal) {
        resumenModal = document.createElement('div');
        resumenModal.id = 'resumen-modal';
        resumenModal.style.display = 'none';
        resumenModal.style.position = 'fixed';
        resumenModal.style.top = '0';
        resumenModal.style.left = '0';
        resumenModal.style.width = '100vw';
        resumenModal.style.height = '100vh';
        resumenModal.style.zIndex = '9999';
        resumenModal.style.background = 'rgba(0, 0, 0, 0.5)';
        resumenModal.style.backdropFilter = 'blur(2px)';
        resumenModal.innerHTML = `<div id="resumen-compra-container" style="background:#fff; max-width:500px; margin:5vh auto; border-radius:10px; padding:2em; position:relative; box-shadow: 0 4px 15px rgba(0,0,0,0.2);"></div>`;
        document.body.appendChild(resumenModal);
    }
    const resumenContainer = document.getElementById('resumen-compra-container');

    // Crea el contenedor para el total y el botón
    let infoTotalContainer = document.getElementById('info-total-container');
    if (!infoTotalContainer) {
        infoTotalContainer = document.createElement('div');
        infoTotalContainer.id = 'info-total-container';
        infoContainer.parentNode.insertBefore(infoTotalContainer, infoContainer.nextSibling);
    }

    const resumenParams = new URLSearchParams();
    if (idFuncion) resumenParams.set('funcion', idFuncion);
    if (idPelicula) resumenParams.set('pelicula', idPelicula);
    if (asientos) resumenParams.set('asientos', asientos);
    if (promos) resumenParams.set('promos', promos);
    if (productos) resumenParams.set('productos', productos);

    try {
        const urlDeResumen = BASE_API_DOMAIN + 'getResumenCompra.php?' + resumenParams.toString();
        console.log("URL para obtener resumen:", urlDeResumen); // Log para ver la URL
        
        const res = await fetch(urlDeResumen);

        if (!res.ok) {
            // Si la respuesta no es exitosa (ej. 404, 500), muestra el estado
            throw new Error(`Error en la petición: ${res.status} ${res.statusText}`);
        }

        const resumen = await res.json();

        // Muestra el precio total y el botón
        infoTotalContainer.innerHTML = `
            <div>
                <div>
                    <strong>Total: S/${resumen.total.toFixed(2)}</strong>
                </div>
                <button id="btn-ver-resumen" type="button">Ver Resumen de compra</button>
            </div>
        `;

        // Renderiza el resumen para el modal
        let html = `<div>
            <div>
                <h2>Resumen de compra</h2>
                <button type="button" id="btn-cerrar-resumen">Cerrar</button>
            </div>
            <div>`;
        if (resumen.asientos && resumen.asientos.length > 0) {
            html += `<div><strong>Butacas Seleccionadas:</strong><br>${resumen.asientos.join(', ')} <span>Cant. ${resumen.asientos.length}</span></div>`;
        }
        if (resumen.entradas && resumen.entradas.length > 0) {
            html += `<div><strong>Entradas:</strong></div>`;
            resumen.entradas.forEach(e => {
                html += `<div>
                    ${e.nombre}${e.descripcion ? `<br><span>${e.descripcion}</span>` : ''}
                    <span>Cant. ${e.cantidad}</span>
                    <span>S/${e.precio.toFixed(2)}</span>
                </div>`;
            });
            html += `<div>Sub-Total S/${resumen.totalEntradas.toFixed(2)}</div>`;
        }
        if (resumen.dulceria && resumen.dulceria.length > 0) {
            html += `<div><strong>Dulcería:</strong></div>`;
            resumen.dulceria.forEach(d => {
                html += `<div>
                    ${d.nombre}${d.descripcion ? `<br><span>${d.descripcion}</span>` : ''}
                    <span>Cant. ${d.cantidad}</span>
                    <span>S/${d.precio.toFixed(2)}</span>
                </div>`;
            });
            html += `<div>Sub-Total S/${resumen.totalDulceria.toFixed(2)}</div>`;
        }
        html += `<hr>`;
        html += `<div>Precio Total: S/${resumen.total.toFixed(2)}</div>`;
        html += `</div></div>`;

        resumenContainer.innerHTML = html;

        // Mostrar/ocultar resumen en modal
        document.getElementById('btn-ver-resumen').onclick = () => {
            resumenModal.style.display = 'block';
        };
        resumenContainer.querySelector('#btn-cerrar-resumen').onclick = () => {
            resumenModal.style.display = 'none';
        };
    } catch (error) {
        console.error("Error al cargar el resumen de compra:", error); // Log para ver el error exacto
        infoTotalContainer.innerHTML = '<div>Error al cargar el resumen de compra. Revisa la consola para más detalles.</div>';
    }

    // Aquí irá la lógica para mostrar el resumen de la compra y el formulario de pago

    // Rellenar y deshabilitar campos si el usuario está logueado
    if (sessionData.socio) {
        const form = document.getElementById('form-pago');
        // Nombre
        if (form.nombre) {
            form.nombre.value = sessionData.socio.nombre || '';
            form.nombre.readOnly = true;
        }
        // Email
        if (form.correo) {
            form.correo.value = sessionData.socio.email || '';
            form.correo.readOnly = true;
        }
        // DNI
        const tipoDocumento = (sessionData.socio.tipoDocumento || '').toUpperCase();
        const numeroDocumento = sessionData.socio.numeroDocumento || '';
        // Tarjeta
        if (form['num-doc-tarjeta']) {
            form['num-doc-tarjeta'].value = numeroDocumento;
            form['num-doc-tarjeta'].readOnly = true;
        }
        if (form['tipo-doc-tarjeta']) {
            form['tipo-doc-tarjeta'].value = tipoDocumento === 'DNI' ? 'dni' : '';
            form['tipo-doc-tarjeta'].disabled = true;
        }
        // Agora
        if (form['num-doc-agora']) {
            form['num-doc-agora'].value = numeroDocumento;
            form['num-doc-agora'].readOnly = true;
        }
        if (form['tipo-doc-agora']) {
            form['tipo-doc-agora'].value = tipoDocumento === 'DNI' ? 'dni' : '';
            form['tipo-doc-agora'].disabled = true;
        }
        // Billetera
        if (form['num-doc-billetera']) {
            form['num-doc-billetera'].value = numeroDocumento;
            form['num-doc-billetera'].readOnly = true;
        }
        if (form['tipo-doc-billetera']) {
            form['tipo-doc-billetera'].value = tipoDocumento === 'DNI' ? 'dni' : '';
            form['tipo-doc-billetera'].disabled = true;
        }
        // Celular
        const celular = sessionData.socio.celular || '';
        if (form['celular-agora']) {
            form['celular-agora'].value = celular;
            form['celular-agora'].readOnly = true;
        }
        if (form['celular-billetera']) {
            form['celular-billetera'].value = celular;
            form['celular-billetera'].readOnly = true;
        }
    }

    // --- NUEVO: Lógica de verificación de documento al pagar ---
    const form = document.getElementById('form-pago');
    // Detectar todos los botones de pago
    form.querySelectorAll('button[type="submit"]').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault(); // Evita el submit normal

            // Si está logueado, usar el id del socio
            if (sessionData.socio && sessionData.socio.id) {
                alert(`ID de usuario (socio logueado): ${sessionData.socio.id}`);
                return;
            }

            // Detectar método de pago
            const metodo = btn.getAttribute('data-metodo');
            let tipoDocumento = '', numeroDocumento = '', nombreCompleto = '', correoElectronico = '';

            nombreCompleto = form.nombre.value.trim();
            correoElectronico = form.correo.value.trim();

            if (metodo === 'tarjeta') {
                tipoDocumento = form['tipo-doc-tarjeta'].value;
                numeroDocumento = form['num-doc-tarjeta'].value.trim();
            } else if (metodo === 'agora') {
                tipoDocumento = form['tipo-doc-agora'].value;
                numeroDocumento = form['num-doc-agora'].value.trim();
            } else if (metodo === 'billetera') {
                tipoDocumento = form['tipo-doc-billetera'].value;
                numeroDocumento = form['num-doc-billetera'].value.trim();
            }

            // Validar campos mínimos
            if (!tipoDocumento || !numeroDocumento || !nombreCompleto || !correoElectronico) {
                alert('Completa todos los campos requeridos.');
                return;
            }

            // Consultar al backend
            try {
                const res = await fetch(`${BASE_API_DOMAIN}verificarDocumento.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tipoDocumento,
                        numeroDocumento,
                        nombreCompleto,
                        correoElectronico
                    })
                });
                const data = await res.json();

                if (data.status === 'socio') {
                    alert(data.message);
                } else if (data.status === 'usuario' || data.status === 'insertado') {
                    alert(`ID de usuario: ${data.idUsuario}`);
                } else {
                    alert(data.message || 'Error desconocido');
                }
            } catch (err) {
                alert('Error al verificar el documento. Intenta nuevamente.');
            }
        });
    });
});
