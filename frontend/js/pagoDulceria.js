import BASE_API_DOMAIN from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
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

    // Renderiza solo la info del cine si hay ciudad y cine
    const idCiudad = params.get('ciudad');
    const idCine = params.get('cine');
    const infoContainer = document.getElementById('info-container');
    if (idCiudad && idCine) {
        try {
            const res = await fetch(BASE_API_DOMAIN + `getInfoCine.php?idCine=${idCine}`);
            const cine = await res.json();
            infoContainer.innerHTML = `
                <div style="text-align:center;">
                    ${cine.imagen ? `<img src="${cine.imagen}" alt="Foto cine" style="width:140px;height:140px;border-radius:12px;object-fit:cover;">` : ''}
                </div>
                <h2 style="text-align:center; margin:0.5em 0;">${cine.nombre || ''}</h2>
                <div style="text-align:center;">${cine.direccion || ''}</div>
                <hr style="margin:1em 0;">
            `;
        } catch {
            infoContainer.textContent = 'No se pudo cargar la información del cine.';
        }
    }

    // Renderiza la info y resumen de dulcería
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
    const productosArr = parseProductos(productos);

    // Obtén precios y muestra resumen
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

    await completarPreciosProductos(productosArr);

    // Calcula totales
    const subtotal = productosArr.reduce((acc, prod) => acc + (prod.subtotal || 0), 0);
    const total = subtotal;

    // Renderiza resumen
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

    infoTotalContainer.innerHTML = `
        <div>
            <div>
                <strong>Total: S/${total.toFixed(2)}</strong>
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
        <div>
            <div><strong>Dulcería:</strong></div>
            <ul>
                ${productosArr.map(p => `<li>${p.cantidad} x ${p.idProducto} - S/${p.precioUnitario} = S/${p.subtotal?.toFixed(2) ?? '0.00'}</li>`).join('')}
            </ul>
            <div>Sub-Total S/${total.toFixed(2)}</div>
            <hr>
            <div>Precio Total: S/${total.toFixed(2)}</div>
        </div>
    </div>`;
    resumenContainer.innerHTML = html;

    // Mostrar/ocultar resumen en modal
    document.getElementById('btn-ver-resumen').onclick = () => {
        resumenModal.style.display = 'block';
    };
    resumenContainer.querySelector('#btn-cerrar-resumen').onclick = () => {
        resumenModal.style.display = 'none';
    };

    // Formulario de pago
    const form = document.getElementById('form-pago');

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

    // Modal de error y éxito
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

    // Modal de éxito
    async function mostrarModalExito(idBoleta) {
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
            modal.innerHTML = `
                <div id="modal-exito-content" style="background:#fff; max-width:700px; margin:5vh auto; border-radius:16px; padding:40px 40px 28px 40px; position:relative; box-shadow:0 4px 20px #0002;">
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Datos para el resumen
        const nombreCliente = sessionData.socio?.nombre || '';
        // Fecha Perú
        function getFechaPeru() {
            const now = new Date();
            const peruOffset = -5 * 60;
            const localOffset = now.getTimezoneOffset();
            const diff = peruOffset - localOffset;
            const peruDate = new Date(now.getTime() + diff * 60000);
            return peruDate.toISOString().slice(0, 10);
        }
        const fechaCompra = getFechaPeru();

        // Usa getCiudades.php para obtener el nombre de la ciudad
        let ciudadNombre = '';
        if (idCiudad) {
            try {
                const res = await fetch(`${BASE_API_DOMAIN}getCiudades.php`);
                const ciudades = await res.json();
                const ciudadObj = ciudades.find(c => String(c.id) === String(idCiudad));
                ciudadNombre = ciudadObj ? ciudadObj.nombre : '';
            } catch {
                ciudadNombre = '';
            }
        }
        const cineNombre = infoContainer.querySelector('h2')?.textContent || 'Cineplanet';

        // QR con id de compra
        const qrUrl = `ID:${idBoleta}`;
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
                        <span style="font-size:1.2em;color:#1565c0;">&#127963;</span>
                        <span style="color:#1565c0;">${ciudadNombre}</span>
                    </span>
                </div>
                <div style="border-top:1px dashed #1565c0;margin:0.5em 0;"></div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#128197;</span>
                        <span style="color:#1565c0;">${fechaCompra}</span>
                    </span>
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#127909;</span>
                        <span style="color:#1565c0;">${cineNombre}</span>
                    </span>
                </div>
            </div>
        </div>
        `;

        let mensajeQRHtml = `
        <div style="color:#d32f2f;font-size:1em;margin:1.5em 0 1.5em 0;text-align:center;">
            <span style="display:inline-block;">
                <span style="font-size:1.3em;vertical-align:middle;">&#128241;</span>
                Muestra el código QR desde tu celular para canjear tus productos. No necesitas imprimir este documento.
            </span>
        </div>
        `;

        let productosHtml = `
        <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;margin-bottom:1.5em;">
            <div style="background:#f5f6fa;border-radius:8px 8px 0 0;padding:0.7em 1em;display:flex;align-items:center;gap:0.7em;">
                <span style="font-size:1.5em;color:#1565c0;">&#127849;</span>
                <span style="font-weight:600;color:#1565c0;font-size:1.15em;">Productos</span>
            </div>
            <div style="padding:1em 0.5em;">
                ${productosArr.map(p => `
                    <div style="display:flex;align-items:center;justify-content:space-between;font-weight:500;color:#1565c0;">
                        <span>${p.cantidad} x ${p.idProducto}</span>
                        <span>S/${p.precioUnitario}</span>
                        <span>S/${p.subtotal?.toFixed(2) ?? '0.00'}</span>
                    </div>
                `).join('')}
            </div>
            <div style="border-top:1px dashed #1565c0;margin:0.7em 0;"></div>
            <div style="text-align:right;font-weight:700;font-size:1.2em;color:#1565c0;padding-right:0.5em;">
                Sub Total: S/${total.toFixed(2)}
            </div>
        </div>
        `;

        let costoTotalHtml = `
        <div style="background:#192040;border-radius:8px;padding:1.2em 2em;display:flex;justify-content:space-between;align-items:center;margin-top:1.2em;">
            <span style="color:#fff;font-weight:600;font-size:1.15em;">Costo Total</span>
            <span style="color:#fff;font-weight:600;font-size:1.15em;">S/${total.toFixed(2)}</span>
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
                    Dulcería
                </h1>
                ${qrDatosHtml}
                ${mensajeQRHtml}
                ${productosHtml}
                ${costoTotalHtml}
            </div>
        </div>
        `;

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

        // Descargar PDF solo del resumen (sin botones)
        document.getElementById('btn-descargar-pdf').onclick = () => {
            pdfContainer.style.display = 'block';
            const qrImg = pdfContainer.querySelector('#qr-img');
            if (qrImg && !qrImg.complete) {
                qrImg.onload = () => {
                    generarPDF();
                };
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
                        filename: `dulceria_${idBoleta}.pdf`,
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
            window.location.href = '../../index.html';
        };
    }

    async function procesarPago(idUsuario) {
        if (!idUsuario) {
            mostrarModalError('Error: No se pudo obtener un ID de usuario para la boleta.');
            return;
        }
        const datosBoleta = {
            idUsuario: idUsuario,
            fecha: new Date().toISOString().slice(0, 10),
            subtotal: total,
            descuentoTotal: 0,
            total: total
        };
        const payload = {
            ...datosBoleta,
            productosBoleta: productosArr
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
                await mostrarModalExito(resultadoPago.idBoleta);
            } else {
                mostrarModalError('Error en el pago: ' + resultadoPago.message);
            }
        } catch (err) {
            ocultarLoader();
            mostrarModalError('Error al conectar con el servidor para realizar el pago.');
        }
    }

    // Detectar todos los botones de pago
    form.querySelectorAll('button[type="submit"]').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            // Verifica aceptación de términos y tratamiento de datos
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

            // Si está logueado, usar el id del socio y omitir verificación de documento
            if (sessionData.socio && sessionData.socio.id) {
                await procesarPago(sessionData.socio.id);
                return;
            }

            // Validar campos mínimos
            const nombreCompleto = form.nombre.value.trim();
            const correoElectronico = form.correo.value.trim();
            let tipoDocumento = '', numeroDocumento = '';
            const metodo = btn.getAttribute('data-metodo');
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
});
