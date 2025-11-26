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
                <button id="btn-compras" style="font-weight:bold; color:#0a3871;">Mis Compras</button>
                <button id="btn-datos" style="font-weight:bold; color:#0a3871; border-bottom:3px solid #e4002b;">Mis Datos</button>
            </div>
        `;
        document.getElementById('btn-beneficios').onclick = () => window.location.href = 'misBeneficos.html';
        document.getElementById('btn-compras').onclick = () => window.location.href = 'misCompras.html';
        document.getElementById('btn-datos').onclick = () => {};
    } catch (e) {
        resumenDiv.innerHTML = '<div>Error al cargar datos</div>';
    }
});
