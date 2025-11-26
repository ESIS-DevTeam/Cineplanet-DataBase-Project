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
                                <a href="../pdf/boleta.php?id=${compra.idCompra}" target="_blank" title="Descargar PDF">
                                    <img src="../images/items/pdf-icon.svg" alt="PDF" style="width:24px;">
                                </a>
                            </td>
                        </tr>
                    `;
                }
                html += '</tbody></table>';
                main.insertAdjacentHTML('beforeend', html);
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
