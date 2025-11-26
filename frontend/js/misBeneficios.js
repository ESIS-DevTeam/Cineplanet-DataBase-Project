import BASE_API_DOMAIN from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const resumenDiv = document.getElementById('resumen-socio');
    try {
        // 1. Obtener el id del socio desde la sesión
        const sessionRes = await fetch(BASE_API_DOMAIN.replace('/api/', '/auth/') + 'checkSession.php');
        const sessionData = await sessionRes.json();
        const id = sessionData?.socio?.id;
        console.log('ID de socio obtenido de la sesión:', id);

        // 2. Enviar el id al endpoint de resumen
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
                <button id="btn-beneficios" style="font-weight:bold; color:#0a3871; border-bottom:3px solid #e4002b;">Mis Beneficios</button>
                <button id="btn-compras" style="font-weight:bold; color:#0a3871;">Mis Compras</button>
                <button id="btn-datos" style="font-weight:bold; color:#0a3871;">Mis Datos</button>
            </div>
        `;
        document.getElementById('btn-beneficios').onclick = () => {};
        document.getElementById('btn-compras').onclick = () => window.location.href = 'misCompras.html';
        document.getElementById('btn-datos').onclick = () => window.location.href = 'misDatos.html';

        // Mostrar beneficios de entradas y dulcería
        const beneficiosRes = await fetch(BASE_API_DOMAIN + 'socioBeneficios.php?id=' + id);
        const beneficios = await beneficiosRes.json();

        let html = '<h2>Entradas</h2><div>';
        if (beneficios.entradas && beneficios.entradas.length > 0) {
            html += '<div style="display:flex; gap:32px;">';
            beneficios.entradas.forEach(b => {
                html += `<div>
                    <div style="font-weight:bold;">${b.nombre}</div>
                    <div>${b.descripcion || ''}</div>
                    ${b.requierePuntos == 1 ? `<div>Canjea por puntos: ${b.puntosNecesarios}</div>` : ''}
                    ${b.tieneStock == 1 ? `<div>Stock: ${b.stock}</div>` : ''}
                </div>`;
            });
            html += '</div>';
        } else {
            html += '<div>No hay beneficios de entradas disponibles.</div>';
        }
        html += '</div>';

        html += '<h2>Dulcería</h2><div>';
        if (beneficios.dulceria && beneficios.dulceria.length > 0) {
            html += '<div style="display:flex; gap:32px;">';
            beneficios.dulceria.forEach(d => {
                html += `<div>
                    <div style="font-weight:bold;">${d.nombre}</div>
                    <div>${d.descripcion || ''}</div>
                    <div>Precio: S/${d.precio}</div>
                    ${d.canjeaPuntos == 1 ? `<div>Canjea por puntos: ${d.puntosNecesarios}</div>` : ''}
                </div>`;
            });
            html += '</div>';
        } else {
            html += '<div>No hay beneficios de dulcería disponibles.</div>';
        }
        html += '</div>';

        resumenDiv.insertAdjacentHTML('afterend', html);

    } catch (e) {
        resumenDiv.innerHTML = '<div>Error al cargar datos</div>';
    }
});
