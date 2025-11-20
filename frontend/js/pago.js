import BASE_API_DOMAIN from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idFuncion = params.get('funcion');
    const idPelicula = params.get('pelicula');
    const asientos = params.get('asientos');
    const promos = params.get('promos');
    const productos = params.get('productos');

    let infoFuncion = null;
    if (idFuncion) {
        try {
            const resInfo = await fetch(BASE_API_DOMAIN + `getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
            infoFuncion = await resInfo.json();
        } catch {
            // Si falla, muestra error pero sigue
        }
    }

    const main = document.getElementById('info-container');
    if (main) {
        main.innerHTML = '';
        if (infoFuncion) {
            let fechaTexto = '';
            if (infoFuncion.fecha) {
                const fechaObj = new Date(infoFuncion.fecha + 'T00:00:00');
                const hoy = new Date();
                hoy.setHours(0,0,0,0);
                if (fechaObj.getTime() === hoy.getTime()) {
                    fechaTexto = `Hoy, ${fechaObj.getDate()} de ${fechaObj.toLocaleString('es-ES', { month: 'short' })} de ${fechaObj.getFullYear()}`;
                } else {
                    const diasSemana = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
                    fechaTexto = `${diasSemana[fechaObj.getDay()]}, ${fechaObj.getDate()} de ${fechaObj.toLocaleString('es-ES', { month: 'short' })} de ${fechaObj.getFullYear()}`;
                }
            }
            main.innerHTML += `
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
        }

        // Obtener resumen completo desde el endpoint
        let resumen = null;
        try {
            const url = `${BASE_API_DOMAIN}/getResumenCompra.php?funcion=${idFuncion || ''}&pelicula=${idPelicula || ''}&asientos=${asientos || ''}&promos=${promos || ''}&productos=${productos || ''}`;
            const res = await fetch(url);
            resumen = await res.json();
        } catch {
            // Si falla, muestra error
            document.getElementById('info-container').innerHTML += '<div>Error al obtener el resumen de la compra.</div>';
            return;
        }

        // Mostrar total y botón de resumen
        const resumenDiv = document.createElement('div');
        resumenDiv.innerHTML = `
            <div style="font-size:1.2em; margin:1em 0;">
                <strong>Total a pagar: S/${resumen.total.toFixed(2)}</strong>
            </div>
            <button id="btn-ver-resumen">Ver resumen de la compra</button>
        `;
        document.getElementById('info-container').appendChild(resumenDiv);

        document.getElementById('btn-ver-resumen').onclick = () => {
            // Renderiza el resumen en un modal simple (puedes mejorar el diseño)
            let html = `<div style="background:#fff;padding:2em;max-width:500px;margin:2em auto;border-radius:8px;">
                <h2>Resumen de compra</h2>
                <div><b>Butacas Seleccionadas:</b> ${resumen.asientos.join(', ') || '-'}</div>
                <div style="margin-top:1em;"><b>Entradas:</b></div>
                ${resumen.entradas.length === 0 ? '<div>-</div>' : resumen.entradas.map(e => `
                    <div>
                        <span>${e.nombre}</span><br>
                        <small>${e.descripcion || ''}</small><br>
                        Cant. ${e.cantidad} &nbsp; S/${e.precio} &nbsp; Sub-Total S/${e.subtotal.toFixed(2)}
                    </div>
                `).join('')}
                ${resumen.dulceria.length > 0 ? `
                <div style="margin-top:1em;"><b>Dulcería:</b></div>
                ${resumen.dulceria.map(d => `
                    <div>
                        <span>${d.nombre}</span><br>
                        <small>${d.descripcion || ''}</small><br>
                        Cant. ${d.cantidad} &nbsp; S/${d.precio} &nbsp; Sub-Total S/${d.subtotal.toFixed(2)}
                    </div>
                `).join('')}
                ` : ''}
                <hr>
                <div style="font-size:1.2em;color:#d50032;text-align:right;">
                    Precio Total: S/${resumen.total.toFixed(2)}
                </div>
                <div style="text-align:right;margin-top:1em;">
                    <button id="cerrar-modal-resumen">Cerrar</button>
                </div>
            </div>`;
            // Modal básico
            let modal = document.createElement('div');
            modal.id = 'modal-resumen-compra';
            modal.style.position = 'fixed';
            modal.style.top = '0'; modal.style.left = '0'; modal.style.right = '0'; modal.style.bottom = '0';
            modal.style.background = 'rgba(0,0,0,0.2)';
            modal.style.zIndex = '9999';
            modal.innerHTML = html;
            document.body.appendChild(modal);
            document.getElementById('cerrar-modal-resumen').onclick = () => {
                modal.remove();
            };
        };
    }
});