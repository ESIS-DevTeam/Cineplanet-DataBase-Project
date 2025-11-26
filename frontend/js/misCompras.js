import BASE_API_DOMAIN from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const resumenDiv = document.getElementById('resumen-socio');
    try {
        const sessionRes = await fetch(BASE_API_DOMAIN.replace('/api/', '/auth/') + 'checkSession.php');
        const sessionData = await sessionRes.json();
        const id = sessionData?.socio?.id;
        console.log('ID de socio obtenido de la sesión:', id);

        const res = await fetch(BASE_API_DOMAIN + 'socioResumenSimple.php?id=' + id);
        const data = await res.json();
        if (data.error) {
            resumenDiv.innerHTML = '<div>No autenticado</div>';
            return;
        }
        resumenDiv.innerHTML = `
            <div style="display:flex; gap:32px; align-items:center; margin-bottom:24px;">
                <div>
                    <div style="font-size:1.1em;">Tipo de socio:</div>
                    <div style="font-weight:bold; font-size:1.3em; color:#0a3871;">${data.grado}</div>
                </div>
                <div>
                    <div style="font-size:1.1em;">Visitas:</div>
                    <div style="font-weight:bold; font-size:1.3em;">${data.visitas}</div>
                </div>
                <div>
                    <div style="font-size:1.1em;">Puntos:</div>
                    <div style="font-weight:bold; font-size:1.3em;">${data.puntos}</div>
                </div>
            </div>
            <div style="display:flex; gap:32px; justify-content:center;">
                <button id="btn-beneficios" style="font-weight:bold; color:#0a3871;">Mis Beneficios</button>
                <button id="btn-compras" style="font-weight:bold; color:#0a3871; border-bottom:3px solid #e4002b;">Mis Compras</button>
                <button id="btn-datos" style="font-weight:bold; color:#0a3871;">Mis Datos</button>
            </div>
        `;
        document.getElementById('btn-beneficios').onclick = () => window.location.href = 'misBeneficos.html';
        document.getElementById('btn-compras').onclick = () => {};
        document.getElementById('btn-datos').onclick = () => window.location.href = 'misDatos.html';

        // Función para cargar y mostrar las compras del socio
        async function cargarCompras(id) {
            const main = document.querySelector('main');
            try {
                const res = await fetch(BASE_API_DOMAIN + 'misComprasSocio.php?id=' + id);
                const data = await res.json();
                if (data.error) {
                    main.insertAdjacentHTML('beforeend', '<div>No autenticado</div>');
                    return;
                }
                let html = `
                    <table style="width:100%;margin-top:32px;">
                        <thead>
                            <tr>
                                <th>Detalle</th>
                                <th>Fecha</th>
                                <th>Cine</th>
                                <th>Puntos</th>
                                <th>Visitas</th>
                                <th>Compra</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                for (const compra of data.compras) {
                    html += `
                        <tr>
                            <td>${compra.pelicula}</td>
                            <td>${compra.fecha}</td>
                            <td>${compra.cine}</td>
                            <td>${compra.puntos.toFixed(2)}</td>
                            <td>${compra.visitas}</td>
                            <td>
                                <a href="#" class="btn-descargar-pdf" data-id="${compra.idCompra}" title="Descargar PDF">
                                    <img src="../images/items/pdf-icon.svg" alt="PDF" style="width:24px;">
                                </a>
                            </td>
                        </tr>
                    `;
                }
                html += '</tbody></table>';
                main.insertAdjacentHTML('beforeend', html);

                main.querySelectorAll('.btn-descargar-pdf').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const idBoleta = btn.getAttribute('data-id');
                        // 1. Manda el id al endpoint
                        const res = await fetch(BASE_API_DOMAIN + 'getBoletaResumen.php?idBoleta=' + idBoleta);
                        const resumen = await res.json();
                        // 2. Prepara los datos en variables
                        prepararDatosPDF(resumen);
                        // 3. Muestra el modal de resumen antes de generar el PDF
                        mostrarModalResumenPDF();
                    });
                });
            } catch (e) {
                main.insertAdjacentHTML('beforeend', '<div>Error al cargar compras</div>');
            }
        }

        // Mostrar compras debajo de los botones
        await cargarCompras(id);
    } catch (e) {
        resumenDiv.innerHTML = '<div>Error al cargar datos</div>';
    }
});

let pdfBoleta = null;
let pdfProductos = null;
let pdfAsientos = null;
let pdfTipo = null;

function prepararDatosPDF(resumen) {
    pdfBoleta = resumen.boleta;
    pdfProductos = resumen.productos;
    pdfAsientos = resumen.asientos;
    pdfTipo = resumen.tipo;
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

function mostrarModalResumenPDF() {
    let html = '';
    if (pdfTipo === 'dulceria') {
        // Dulcería solo muestra cliente, fecha, productos y totales
        html = `
            <div style="background:#fff;max-width:700px;margin:0 auto;">
                <div style="font-family: 'Segoe UI', Arial, sans-serif; color:#222;">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <img src="https://cineplanet.com.pe/static/media/logo.8e3b8b7c.svg" alt="cineplanet" style="height:40px;">
                        <div style="background:#223a5f;color:#fff;padding:0.5em 1.2em;border-radius:8px;font-weight:bold;font-size:1.1em;">
                            Nro. de Compra: ${pdfBoleta.id}
                        </div>
                    </div>
                    <h1 style="text-align:center; margin:1em 0 0.5em 0; font-size:2em; font-weight:700;">
                        Dulcería
                    </h1>
                    <div style="display:flex;align-items:center;justify-content:center;gap:2.5em;">
                        <div style="flex-shrink:0;">
                            <img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(pdfBoleta.id)}" alt="QR" style="width:140px;height:140px;display:block;border-radius:12px;">
                        </div>
                        <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;min-width:340px;display:flex;flex-direction:column;gap:1em;">
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <span style="font-weight:500;color:#1565c0;">${pdfBoleta.nombreCliente}</span>
                            </div>
                            <div style="border-top:1px dashed #1565c0;margin:0.5em 0;"></div>
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <span style="color:#1565c0;">${pdfBoleta.fecha}</span>
                            </div>
                        </div>
                    </div>
                    <div style="color:#d32f2f;font-size:1em;margin:1.5em 0;text-align:center;">
                        <span style="font-size:1.3em;vertical-align:middle;">&#128241;</span>
                        Muestra el código QR desde tu celular para canjear tus productos. No necesitas imprimir este documento.
                    </div>
                    <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;margin-bottom:1.5em;">
                        <div style="background:#f5f6fa;border-radius:8px 8px 0 0;padding:0.7em 1em;">
                            <span style="font-weight:600;color:#1565c0;font-size:1.15em;">Dulcería</span>
                        </div>
                        <div style="padding:1em 0.5em;">
                            ${pdfProductos.map(p => `
                                <div style="display:flex;align-items:center;justify-content:space-between;font-weight:500;color:#1565c0;">
                                    <span>${p.nombre}</span>
                                    <span>Cant: ${p.cantidad}</span>
                                    <span>S/${parseFloat(p.subtotal).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div style="border-top:1px dashed #1565c0;margin:0.7em 0;"></div>
                        <div style="text-align:right;font-weight:700;font-size:1.2em;color:#1565c0;">
                            Sub Total: S/${parseFloat(pdfBoleta.subtotal).toFixed(2)}
                        </div>
                    </div>
                    <div style="background:#192040;border-radius:8px;padding:1.2em 2em;display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:#fff;font-weight:600;font-size:1.15em;">Costo Total</span>
                        <span style="color:#fff;font-weight:600;font-size:1.15em;">S/${parseFloat(pdfBoleta.total).toFixed(2)}</span>
                    </div>
                    <div style="text-align:center;margin-top:1em;">
                        <button id="btn-descargar-pdf-final">Descargar PDF</button>
                        <button id="btn-cerrar-resumen-pdf" style="margin-left:1em;">Aceptar</button>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Compra completa: incluye película, cine, sala, asientos, QR, entradas y dulcería
        html = `
            <div style="background:#fff;max-width:700px;margin:0 auto;">
                <div style="font-family: 'Segoe UI', Arial, sans-serif; color:#222;">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <img src="https://cineplanet.com.pe/static/media/logo.8e3b8b7c.svg" alt="cineplanet" style="height:40px;">
                        <div style="background:#223a5f;color:#fff;padding:0.5em 1.2em;border-radius:8px;font-weight:bold;font-size:1.1em;">
                            Nro. de Compra: ${pdfBoleta.id}
                        </div>
                    </div>
                    <h1 style="text-align:center; margin:1em 0 0.5em 0; font-size:2em; font-weight:700;">
                        ${pdfBoleta.nombrePelicula || ''}
                    </h1>
                    <div style="display:flex;align-items:center;justify-content:center;gap:2.5em;">
                        <div style="flex-shrink:0;">
                            <img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(pdfBoleta.id)}" alt="QR" style="width:140px;height:140px;display:block;border-radius:12px;">
                        </div>
                        <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;min-width:340px;display:flex;flex-direction:column;gap:1em;">
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <span style="font-weight:500;color:#1565c0;">${pdfBoleta.nombreCliente}</span>
                                <span style="color:#1565c0;">${pdfBoleta.cine}</span>
                            </div>
                            <div style="border-top:1px dashed #1565c0;margin:0.5em 0;"></div>
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <span style="color:#1565c0;">${pdfBoleta.fecha}</span>
                                <span style="color:#1565c0;">${pdfBoleta.hora}</span>
                            </div>
                            <div style="border-top:1px dashed #1565c0;margin:0.5em 0;"></div>
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <span style="color:#1565c0;">SALA ${pdfBoleta.sala}</span>
                                <span style="color:#1565c0;">${pdfBoleta.asientos?.join(', ')}</span>
                            </div>
                        </div>
                    </div>
                    <div style="color:#d32f2f;font-size:1em;margin:1.5em 0;text-align:center;">
                        <span style="font-size:1.3em;vertical-align:middle;">&#128241;</span>
                        Muestra el código QR desde tu celular para canjear tus combos e ingresar a la sala. No necesitas imprimir este documento.
                    </div>
                    <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;margin-bottom:1.5em;">
                        <div style="background:#f5f6fa;border-radius:8px 8px 0 0;padding:0.7em 1em;">
                            <span style="font-weight:600;color:#1565c0;font-size:1.15em;">Entradas</span>
                        </div>
                        <div style="padding:1em 0.5em;">
                            <div style="display:flex;align-items:center;justify-content:space-between;font-weight:500;color:#1565c0;">
                                <span>General</span>
                                <span>Cant: ${pdfBoleta.asientos?.length || 1}</span>
                                <span>S/${parseFloat(pdfBoleta.subtotal).toFixed(2)}</span>
                            </div>
                        </div>
                        <div style="border-top:1px dashed #1565c0;margin:0.7em 0;"></div>
                        <div style="text-align:right;font-weight:700;font-size:1.2em;color:#1565c0;">
                            Sub Total: S/${parseFloat(pdfBoleta.subtotal).toFixed(2)}
                        </div>
                    </div>
                    ${pdfProductos && pdfProductos.length > 0 ? `
                    <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;margin-bottom:1.5em;">
                        <div style="background:#f5f6fa;border-radius:8px 8px 0 0;padding:0.7em 1em;">
                            <span style="font-weight:600;color:#1565c0;font-size:1.15em;">Dulcería</span>
                        </div>
                        <div style="padding:1em 0.5em;">
                            ${pdfProductos.map(d => `
                                <div style="display:flex;align-items:center;justify-content:space-between;font-weight:500;color:#1565c0;">
                                    <span>${d.nombre}</span>
                                    <span>Cant: ${d.cantidad}</span>
                                    <span>S/${parseFloat(d.subtotal).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div style="border-top:1px dashed #1565c0;margin:0.7em 0;"></div>
                        <div style="text-align:right;font-weight:700;font-size:1.2em;color:#1565c0;">
                            Sub Total: S/${pdfProductos.reduce((acc, d) => acc + (parseFloat(d.subtotal) || 0), 0).toFixed(2)}
                        </div>
                    </div>
                    ` : ''}
                    <div style="background:#192040;border-radius:8px;padding:1.2em 2em;display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:#fff;font-weight:600;font-size:1.15em;">Costo Total</span>
                        <span style="color:#fff;font-weight:600;font-size:1.15em;">S/${parseFloat(pdfBoleta.total).toFixed(2)}</span>
                    </div>
                    <div style="text-align:center;margin-top:1em;">
                        <button id="btn-descargar-pdf-final">Descargar PDF</button>
                        <button id="btn-cerrar-resumen-pdf" style="margin-left:1em;">Aceptar</button>
                    </div>
                </div>
            </div>
        `;
    }

    let modal = document.getElementById('modal-resumen-pdf');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-resumen-pdf';
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
        // Aplica la clase para ocultar el scrollbar
        modal.innerHTML = `<div id="modal-resumen-pdf-content" class="hide-scrollbar" style="background:#fff; max-width:700px; max-height:80vh; overflow:auto; margin:5vh auto; border-radius:16px; padding:40px 40px 28px 40px; position:relative; box-shadow:0 4px 20px #0002;"></div>`;
        document.body.appendChild(modal);
    }
    modal.querySelector('#modal-resumen-pdf-content').innerHTML = html;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    document.getElementById('btn-cerrar-resumen-pdf').onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    };

    document.getElementById('btn-descargar-pdf-final').onclick = async () => {
        // 1. Clona el contenido
        const originalContent = document.getElementById('modal-resumen-pdf-content');
        const modalContent = originalContent.cloneNode(true);

        // 2. Limpiar estilos que rompen el PDF en el clon
        modalContent.removeAttribute('id');
        modalContent.style.maxHeight = 'none';
        modalContent.style.height = 'auto';
        modalContent.style.overflow = 'visible';
        modalContent.style.boxShadow = 'none';
        modalContent.style.margin = '0';

        // 3. Preparar el contenedor PDF
        let pdfContainer = document.getElementById('modal-resumen-pdf-pdf');
        if (!pdfContainer) {
            pdfContainer = document.createElement('div');
            pdfContainer.id = 'modal-resumen-pdf-pdf';
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '-9999px';
            pdfContainer.style.top = '0';
            pdfContainer.style.width = '750px';
            pdfContainer.style.background = '#ffffff';
            document.body.appendChild(pdfContainer);
        }
        pdfContainer.innerHTML = '';
        pdfContainer.appendChild(modalContent);

        // 4. Quita los botones del PDF
        pdfContainer.querySelector('#btn-descargar-pdf-final')?.remove();
        pdfContainer.querySelector('#btn-cerrar-resumen-pdf')?.remove();

        // Espera a que las imágenes carguen
        function cargarImagenes() {
            const imgs = pdfContainer.querySelectorAll('img');
            return Promise.all(Array.from(imgs).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(res => { img.onload = img.onerror = res; });
            }));
        }

        try {
            await cargarImagenes();

            // Carga jsPDF y html2canvas si no existen
            if (!window.jspdf) {
                await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            }
            if (!window.html2canvas) {
                await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            }

            await new Promise(r => setTimeout(r, 100));

            // Usa html2canvas para capturar el contenido como imagen
            const canvas = await window.html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                scrollY: 0,
                windowWidth: 800
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.98);

            // Crea el PDF con jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Calcula dimensiones para la imagen en el PDF
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20;
            const imgHeight = canvas.height * imgWidth / canvas.width;

            let y = 10;
            pdf.addImage(imgData, 'JPEG', 10, y, imgWidth, imgHeight);

            pdf.save(pdfTipo === 'dulceria' ? `dulceria_${pdfBoleta.id}.pdf` : `compra_${pdfBoleta.id}.pdf`);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el PDF: ' + (error?.message || error));
            // Opcional: muestra el error en el modal
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.style.marginTop = '16px';
            errorDiv.textContent = 'Error al generar el PDF: ' + (error?.message || error);
            originalContent.appendChild(errorDiv);
        } finally {
            if(pdfContainer) pdfContainer.remove();
        }
    };
}

// El contenido del modal es el que se guarda en el PDF.
// Si quieres cambiar el diseño del PDF, modifica el HTML generado en mostrarModalResumenPDF.
