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

    // Agrega la clase CSS global para ocultar el scrollbar si no existe
    if (!document.getElementById('hide-scrollbar-style')) {
        const style = document.createElement('style');
        style.id = 'hide-scrollbar-style';
        style.innerHTML = `
            .hide-scrollbar {
                scrollbar-width: none;
            }
            .hide-scrollbar::-webkit-scrollbar {
                display: none;
            }
        `;
        document.head.appendChild(style);
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
        // scroll interno invisible para el contenido
        resumenModal.innerHTML = `<div id="resumen-compra-container" class="hide-scrollbar" style="background:#fff; max-width:500px; max-height:80vh; overflow:auto; margin:5vh auto; border-radius:10px; padding:2em; position:relative; box-shadow: 0 4px 15px rgba(0,0,0,0.2);"></div>`;
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

        // Mostrar/ocultar resumen en modal (sin modificar el scroll del body)
        document.getElementById('btn-ver-resumen').onclick = () => {
            resumenModal.style.display = 'block';
            // document.body.style.overflow = 'hidden'; // <-- Elimina/desactiva esta línea
        };
        resumenContainer.querySelector('#btn-cerrar-resumen').onclick = () => {
            resumenModal.style.display = 'none';
            // document.body.style.overflow = ''; // <-- Elimina/desactiva esta línea
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

    // --- NUEVO: Lógica de verificación de documento y pago ---
    const form = document.getElementById('form-pago');

    // Modal para errores
    function mostrarModalError(mensaje, onAceptar) {
        let modal = document.getElementById('modal-error');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-error';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.45)';
            modal.style.zIndex = '99999';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.innerHTML = `
                <div style="background:#fff; padding:2em; border-radius:10px; box-shadow:0 4px 20px #0002; max-width:350px; text-align:center;">
                    <div id="modal-error-msg" style="margin-bottom:1em; font-size:1.1em;"></div>
                    <button id="modal-error-aceptar" style="padding:0.5em 2em;">Aceptar</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        modal.querySelector('#modal-error-msg').textContent = mensaje;
        modal.style.display = 'flex';
        const btnAceptar = modal.querySelector('#modal-error-aceptar');
        btnAceptar.onclick = () => {
            modal.style.display = 'none';
            if (typeof onAceptar === 'function') onAceptar();
        };
    }

    // Loader modal
    function mostrarLoader() {
        let loader = document.getElementById('modal-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'modal-loader';
            loader.style.position = 'fixed';
            loader.style.top = '0';
            loader.style.left = '0';
            loader.style.width = '100vw';
            loader.style.height = '100vh';
            loader.style.background = 'rgba(0,0,0,0.45)';
            loader.style.zIndex = '99999';
            loader.style.display = 'flex';
            loader.style.alignItems = 'center';
            loader.style.justifyContent = 'center';
            loader.innerHTML = `
                <div style="background:#fff; padding:2em; border-radius:10px; box-shadow:0 4px 20px #0002; text-align:center;">
                    <div style="margin-bottom:1em;">
                        <span style="font-size:2em;">⏳</span>
                    </div>
                    <div>Procesando pago...</div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }
    function ocultarLoader() {
        const loader = document.getElementById('modal-loader');
        if (loader) loader.style.display = 'none';
    }

    // --- NUEVO: Obtener info de asientos y sala ---
    async function getAsientosSalaInfo(idsPlanoSala) {
        if (!idsPlanoSala || idsPlanoSala.length === 0) return { salaNombre: '', asientos: [] };
        try {
            const res = await fetch(BASE_API_DOMAIN + 'getAsientosSalaInfo.php?ids=' + idsPlanoSala.join(','));
            return await res.json();
        } catch {
            return { salaNombre: '', asientos: [] };
        }
    }

    // Modal de éxito con resumen visual y botón PDF
    async function mostrarModalExito(idBoleta, resumen, datosBoleta, datosBoletaAsiento, datosPromoBoleta) {
        let modal = document.getElementById('modal-exito');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-exito';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.45)';
            modal.style.zIndex = '99999';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            // scroll interno invisible para el contenido
            modal.innerHTML = `<div id="modal-exito-content" class="hide-scrollbar" style="background:#fff; max-width:700px; max-height:80vh; overflow:auto; margin:5vh auto; border-radius:16px; padding:40px 40px 28px 40px; position:relative; box-shadow:0 4px 20px #0002;"></div>`;
            document.body.appendChild(modal);
        }

        // Obtener info de asientos y sala
        const idsPlanoSala = datosBoletaAsiento.map(a => a.idPlanoSala);
        const asientosSalaInfo = await getAsientosSalaInfo(idsPlanoSala);
        const salaNombre = asientosSalaInfo.salaNombre || resumen?.nombreSala || '';
        const asientosFormateados = asientosSalaInfo.asientos.length > 0
            ? asientosSalaInfo.asientos.map(a => `${a.fila}${a.numero}`).join(', ')
            : datosBoletaAsiento.map(a => a.idPlanoSala).join(', ');

        // Obtener la hora correctamente
        let horaFuncion = resumen?.hora || infoFuncion?.hora || '';
        let nombreCine = resumen?.nombreCine || infoFuncion?.nombreCine || '';
        let fechaFuncion = resumen?.fecha || datosBoleta.fecha || '';
        let nombreCliente = sessionData.socio?.nombre || '';

        // Generar QR
        const qrUrl = `${BASE_API_DOMAIN}verificarQR.php?idBoleta=${idBoleta}`;
        const qrImg = `<img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrUrl)}" alt="QR" style="width:140px;height:140px;display:block;margin:auto;border-radius:12px;">`;

        // Bloque QR + datos alineados horizontalmente y borde alineado (ancho mayor)
        let qrDatosHtml = `
        <div style="display:flex;align-items:center;justify-content:center;gap:2.5em;">
            <div style="flex-shrink:0;">
                <img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrUrl)}" alt="QR" style="width:140px;height:140px;display:block;border-radius:12px;">
            </div>
            <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;min-width:340px;display:flex;flex-direction:column;gap:1em;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#128100;</span>
                        <span style="font-weight:500;color:#1565c0;">${nombreCliente}</span>
                    </span>
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#128205;</span>
                        <span style="color:#1565c0;">${nombreCine}</span>
                    </span>
                </div>
                <div style="border-top:1px dashed #1565c0;margin:0.5em 0;"></div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#128197;</span>
                        <span style="color:#1565c0;">${fechaFuncion}</span>
                    </span>
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#128337;</span>
                        <span style="color:#1565c0;">${horaFuncion}</span>
                    </span>
                </div>
                <div style="border-top:1px dashed #1565c0;margin:0.5em 0;"></div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#127970;</span>
                        <span style="color:#1565c0;">SALA ${salaNombre}</span>
                    </span>
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#128186;</span>
                        <span style="color:#1565c0;">${asientosFormateados}</span>
                    </span>
                </div>
            </div>
        </div>
        `;

        // Mensaje en rojo debajo del QR
        let mensajeQRHtml = `
        <div style="color:#d32f2f;font-size:1em;margin:1.5em 0 1.5em 0;text-align:center;">
            <span style="display:inline-block;">
                <span style="font-size:1.3em;vertical-align:middle;">&#128241;</span>
                Muestra el código QR desde tu celular para canjear tus combos e ingresar a la sala. No necesitas pasar por boletería ni imprimir este documento.
            </span>
        </div>
        `;

        // Bloque de entradas alineado con borde y ancho mayor
        let entradasHtml = `
        <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;margin-bottom:1.5em;">
            <div style="background:#f5f6fa;border-radius:8px 8px 0 0;padding:0.7em 1em;display:flex;align-items:center;gap:0.7em;">
                <span style="font-size:1.5em;color:#1565c0;">&#127915;</span>
                <span style="font-weight:600;color:#1565c0;font-size:1.15em;">Entradas</span>
            </div>
            <div style="padding:1em 0.5em;">
                ${(resumen.entradas || []).map(e => `
                    <div style="display:flex;align-items:center;justify-content:space-between;font-weight:500;color:#1565c0;">
                        <span>${e.nombre}</span>
                        <span>Cant: ${e.cantidad}</span>
                        <span>S/${e.precio.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div style="border-top:1px dashed #1565c0;margin:0.7em 0;"></div>
            <div style="text-align:right;font-weight:700;font-size:1.2em;color:#1565c0;padding-right:0.5em;">
                Sub Total: S/${datosBoleta.subtotal.toFixed(2)}
            </div>
        </div>
        `;

        // Bloque de dulcería (solo si hay productos)
        let dulceriaHtml = '';
        if (resumen.dulceria && resumen.dulceria.length > 0) {
            dulceriaHtml = `
            <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;margin-bottom:1.5em;">
                <div style="background:#f5f6fa;border-radius:8px 8px 0 0;padding:0.7em 1em;display:flex;align-items:center;gap:0.7em;">
                    <span style="font-size:1.5em;color:#1565c0;">&#127849;</span>
                    <span style="font-weight:600;color:#1565c0;font-size:1.15em;">Dulcería</span>
                </div>
                <div style="padding:1em 0.5em;">
                    ${resumen.dulceria.map(d => `
                        <div style="display:flex;align-items:center;justify-content:space-between;font-weight:500;color:#1565c0;">
                            <span>${d.nombre}</span>
                            <span>Cant: ${d.cantidad}</span>
                            <span>S/${d.precio.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="border-top:1px dashed #1565c0;margin:0.7em 0;"></div>
                <div style="text-align:right;font-weight:700;font-size:1.2em;color:#1565c0;padding-right:0.5em;">
                    Sub Total: S/${resumen.totalDulceria ? resumen.totalDulceria.toFixed(2) : '0.00'}
                </div>
            </div>
            `;
        }

        // Bloque "Costo Total" visual igual a la imagen
        let costoTotalHtml = `
        <div style="background:#192040;border-radius:8px;padding:1.2em 2em;display:flex;justify-content:space-between;align-items:center;margin-top:1.2em;">
            <span style="color:#fff;font-weight:600;font-size:1.15em;">Costo Total</span>
            <span style="color:#fff;font-weight:600;font-size:1.15em;">S/${datosBoleta.total.toFixed(2)}</span>
        </div>
        `;

        let resumenHtml = `
        <div style="background:#fff;max-width:700px;margin:0 auto;display:flex;flex-direction:column;align-items:center;">
            <div style="font-family: 'Segoe UI', Arial, sans-serif; color:#222; width:100%;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <img src="https://cineplanet.com.pe/static/media/logo.8e3b8b7c.svg" alt="cineplanet" style="height:40px;">
                    <div style="background:#223a5f;color:#fff;padding:0.5em 1.2em;border-radius:8px;font-weight:bold;font-size:1.1em;">
                        Nro. de Compra: ${idBoleta}
                    </div>
                </div>
                <h1 style="text-align:center; margin:1em 0 0.5em 0; font-size:2em; font-weight:700;">
                    ${resumen?.nombrePelicula || infoFuncion?.nombrePelicula || ''}
                </h1>
                ${qrDatosHtml}
                ${mensajeQRHtml}
                ${entradasHtml}
                ${dulceriaHtml}
                ${costoTotalHtml}
            </div>
        </div>
        `;

        // Botones fuera del contenedor PDF
        let botonesHtml = `
            <div style="text-align:center;margin-top:1em;">
                <button id="btn-descargar-pdf">Descargar PDF</button>
                <button id="modal-exito-aceptar" style="margin-left:1em;">Aceptar</button>
            </div>
        `;

        // Contenedor para PDF
        let pdfContainer = document.getElementById('modal-exito-pdf');
        if (!pdfContainer) {
            pdfContainer = document.createElement('div');
            pdfContainer.id = 'modal-exito-pdf';
            pdfContainer.style.display = 'none';
            document.body.appendChild(pdfContainer);
        }
        pdfContainer.innerHTML = resumenHtml;

        // Mostrar en modal
        modal.querySelector('#modal-exito-content').innerHTML = resumenHtml + botonesHtml;
        modal.style.display = 'flex';
        // document.body.style.overflow = 'hidden'; // <-- Elimina/desactiva esta línea

        // Descargar PDF solo del resumen (sin botones)
        document.getElementById('btn-descargar-pdf').onclick = () => {
            pdfContainer.style.display = 'block';
            const qrImg = pdfContainer.querySelector('#qr-img');
            // Espera a que la imagen QR esté cargada antes de generar el PDF
            if (qrImg && !qrImg.complete) {
                qrImg.onload = () => {
                    generarPDF();
                };
                // Si la imagen falla al cargar, igual intenta generar el PDF
                qrImg.onerror = () => {
                    generarPDF();
                };
            } else {
                generarPDF();
            }

            function generarPDF() {
                import('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
                .then(() => {
                    html2pdf().from(pdfContainer).set({
                        margin: 24,
                        filename: `boleta_${idBoleta}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
                    }).save().then(() => {
                        pdfContainer.style.display = 'none';
                    });
                })
                .catch(() => {
                    pdfContainer.style.display = 'none';
                    alert('No se pudo cargar el generador de PDF. Verifica tu conexión a internet.');
                });
            }
        };

        document.getElementById('modal-exito-aceptar').onclick = () => {
            modal.style.display = 'none';
            // document.body.style.overflow = ''; // <-- Elimina/desactiva esta línea
            window.location.href = '../../index.html';
        };
    }

    async function procesarPago(idUsuario) {
        if (!idUsuario) {
            mostrarModalError('Error: No se pudo obtener un ID de usuario para la boleta.');
            return;
        }
        // Corrige la fecha para Perú (GMT-5) antes de enviar a la BD
        function getFechaPeru() {
            const now = new Date();
            const peruOffset = -5 * 60;
            const localOffset = now.getTimezoneOffset();
            const diff = peruOffset - localOffset;
            const peruDate = new Date(now.getTime() + diff * 60000);
            return peruDate.toISOString().slice(0, 10);
        }
        datosBoleta.idUsuario = idUsuario;
        datosBoleta.fecha = getFechaPeru();

        const payload = {
            ...datosBoleta,
            idFuncion: idFuncion,
            productosBoleta: datosProductosBoleta,
            promosBoleta: datosPromoBoleta,
            asientosBoleta: datosBoletaAsiento
        };

        mostrarLoader();

        try {
            const res = await fetch(`${BASE_API_DOMAIN}realizarPago.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const resultadoPago = await res.json();

            ocultarLoader();

            if (resultadoPago.success) {
                // Obtener resumen para mostrarlo en el modal
                const resumenRes = await fetch(BASE_API_DOMAIN + 'getResumenCompra.php?' + resumenParams.toString());
                const resumen = await resumenRes.json();
                await mostrarModalExito(resultadoPago.idBoleta, resumen, datosBoleta, datosBoletaAsiento, datosPromoBoleta);
            } else {
                // Manejo de error de asiento ocupado (violación UNIQUE)
                if (
                    resultadoPago.message &&
                    resultadoPago.message.toLowerCase().includes('duplicate entry') &&
                    resultadoPago.message.toLowerCase().includes('uq_funcion_asiento')
                ) {
                    mostrarModalError(
                        'Uno o más asientos ya están ocupados. Por favor, selecciona otros asientos.',
                        () => window.location.href = `peliculaSeleccion.html?pelicula=${idPelicula}`
                    );
                } else {
                    mostrarModalError(`Error en el pago: ${resultadoPago.message}`);
                }
            }
        } catch (err) {
            ocultarLoader();
            mostrarModalError('Error al conectar con el servidor para realizar el pago.');
        }
    }

    // Detectar todos los botones de pago
    form.querySelectorAll('button[type="submit"]').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault(); // Evita el submit normal

            // Validar aceptación de términos y tratamiento de datos
            const terminosCheckbox = document.getElementById('acepto-terminos');
            const tratamientoCheckbox = document.getElementById('acepto-tratamiento');
            if (!terminosCheckbox || !terminosCheckbox.checked) {
                alert('Debes aceptar los Términos y Condiciones antes de continuar con el pago.');
                return;
            }
            if (!tratamientoCheckbox || !tratamientoCheckbox.checked) {
                alert('Debes aceptar el Tratamiento Opcional de datos antes de continuar con el pago.');
                return;
            }

            // Si está logueado, usar el id del socio
            if (sessionData.socio && sessionData.socio.id) {
                await procesarPago(sessionData.socio.id);
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

            // Consultar al backend para verificar/registrar usuario
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
                    await procesarPago(data.idUsuario);
                } else {
                    alert(data.message || 'Error desconocido al verificar documento.');
                }
            } catch (err) {
                alert('Error al verificar el documento. Intenta nuevamente.');
            }
        });
    });

    // Botón cancelar compra al lado del logo de usuario
    const socioDisplay = document.getElementById('socio-display');
    if (socioDisplay && idPelicula) {
        const cancelarBtn = document.createElement('button');
        cancelarBtn.textContent = 'Cancelar compra';
        cancelarBtn.style.marginLeft = '1em';
        cancelarBtn.style.background = '#d32f2f';
        cancelarBtn.style.color = '#fff';
        cancelarBtn.style.border = 'none';
        cancelarBtn.style.padding = '0.7em 1.5em';
        cancelarBtn.style.borderRadius = '8px';
        cancelarBtn.style.fontWeight = 'bold';
        cancelarBtn.style.cursor = 'pointer';
        cancelarBtn.onclick = () => {
            window.location.href = `peliculaSeleccion.html?pelicula=${idPelicula}`;
        };
        socioDisplay.parentNode.insertBefore(cancelarBtn, socioDisplay.nextSibling);
    }

    // --- NUEVO: Preparar datos para cada tabla relacionada con la boleta ---
    function parseCSV(str) {
        return str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
    }

    function parseProductos(str) {
        return str ? str.split(',').map(item => {
            const [id, cantidad] = item.split('-');
            return {
                idProducto: id,
                cantidad: cantidad ? parseInt(cantidad, 10) : 1,
                precioUnitario: null,
                subtotal: null
            };
        }).filter(p => p.idProducto) : [];
    }

    function parsePromos(str) {
        // Espera formato promos=1:2,3:1 (idPromo:cantidad)
        return str ? str.split(',').map(item => {
            const [id, cantidad] = item.split(':');
            return {
                idPromo: id,
                montoDescuento: null,
                cantidad: cantidad ? parseInt(cantidad, 10) : 1, // <--- AGREGADO
                detalle: ''
            };
        }).filter(p => p.idPromo) : [];
    }

    const datosBoleta = {
        idUsuario: null,
        fecha: new Date().toISOString().slice(0, 10),
        subtotal: 0,
        descuentoTotal: 0,
        total: 0
    };

    const datosBoletaAsiento = parseCSV(asientos).map(asiento => ({
        idFuncion: idFuncion,
        idPlanoSala: asiento,
        precioUnitario: null
    }));

    const datosProductosBoleta = parseProductos(productos);
    const datosPromoBoleta = parsePromos(promos);

    async function completarPreciosProductos(arr) {
        for (const prod of arr) {
            try {
                const res = await fetch(`${BASE_API_DOMAIN}getProductoDetallePrecio.php?idProducto=${prod.idProducto}`);
                const data = await res.json();
                prod.precioUnitario = data.precioUnitario ?? null;
                prod.subtotal = prod.precioUnitario !== null ? prod.precioUnitario * prod.cantidad : null;
            } catch {
                prod.precioUnitario = null;
                prod.subtotal = null;
            }
        }
    }

    async function completarDatosPromos(arr, idFuncion) {
        for (const promo of arr) {
            try {
                const res = await fetch(`${BASE_API_DOMAIN}getPromoDetalleDescuento.php?idPromo=${promo.idPromo}&idFuncion=${idFuncion}`);
                const data = await res.json();
                promo.montoDescuento = data.montoDescuento ?? null;
                promo.detalle = data.detalle ?? '';
                promo.precioFinal = data.precioFinal ?? null; // Guardar el precio final
                promo.tipo = data.tipo ?? 'fijo'; // Guardar el tipo
            } catch {
                promo.montoDescuento = null;
                promo.detalle = '';
                promo.precioFinal = null;
                promo.tipo = 'fijo';
            }
        }
    }

    // --- NUEVO: Obtener precio de función y aplicar descuento de promo a cada asiento ---
    async function completarPreciosAsientos(asientosArr, promosArr, idFuncion) {
        if (asientosArr.length === 0 || !idFuncion) return;

        let precioBase = null;
        try {
            const res = await fetch(`${BASE_API_DOMAIN}getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
            const data = await res.json();
            precioBase = data.precio ?? null;
        } catch {
            precioBase = null;
        }

        if (precioBase === null) {
            asientosArr.forEach(asiento => asiento.precioUnitario = null);
            return;
        }

        asientosArr.forEach((asiento, index) => {
            const promo = promosArr.length > 0 ? (promosArr[index] ?? promosArr[0]) : null;
            
            if (promo && promo.precioFinal !== null) {
                asiento.precioUnitario = promo.precioFinal;
            } else {
                asiento.precioUnitario = precioBase;
            }
        });

        return precioBase; // Devuelve el precio base para el cálculo del subtotal
    }

    (async () => {
        await completarPreciosProductos(datosProductosBoleta);
        await completarDatosPromos(datosPromoBoleta, idFuncion);
        const precioBaseAsiento = await completarPreciosAsientos(datosBoletaAsiento, datosPromoBoleta, idFuncion);

        // --- CORREGIDO: Calcular totales para la boleta ---
        const subtotalAsientos = (precioBaseAsiento || 0) * datosBoletaAsiento.length;
        const subtotalProductos = datosProductosBoleta.reduce((acc, prod) => acc + (prod.subtotal || 0), 0);
        datosBoleta.subtotal = subtotalAsientos + subtotalProductos;

        // El descuento total es la suma de los descuentos aplicados a cada asiento.
        const totalAsientosConDescuento = datosBoletaAsiento.reduce((acc, asiento) => acc + (asiento.precioUnitario || 0), 0);
        datosBoleta.descuentoTotal = subtotalAsientos - totalAsientosConDescuento;
        
        datosBoleta.total = datosBoleta.subtotal - datosBoleta.descuentoTotal;
    })();
});
