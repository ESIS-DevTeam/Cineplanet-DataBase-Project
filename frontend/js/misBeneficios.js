import BASE_API_DOMAIN from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const resumenDiv = document.getElementById('resumen-socio');
    try {
        // 1. Obtener el id del socio desde la sesión
        const sessionRes = await fetch(BASE_API_DOMAIN.replace('/api/', '/auth/') + 'checkSession.php');
        const sessionData = await sessionRes.json();
        const id = sessionData?.socio?.id;
        console.log('ID de socio obtenido de la sesión:', id);

        if (!id) {
            resumenDiv.innerHTML = '<div>No autenticado</div>';
            return;
        }

        // Obtener resumen y datos completos simultáneamente
        const [resumenRes, datosRes] = await Promise.all([
            fetch(BASE_API_DOMAIN + 'socioResumenSimple.php?id=' + id),
            fetch(BASE_API_DOMAIN + 'socioDatos.php?id=' + id)
        ]);
        const dataResumen = await resumenRes.json();
        const dataDatos = await datosRes.json();

        if (dataResumen.error || dataDatos.error) {
            resumenDiv.innerHTML = '<div>Error al cargar datos del socio</div>';
            return;
        }

        // Lógica de niveles y progreso
        const visitas = parseInt(dataResumen.visitas) || 0;
        let nextLevel = '';
        let visitsNeeded = 0;
        let progressPercent = 0;
        const currentLevel = dataResumen.grado || 'Clásico';

        if (visitas < 16) {
            nextLevel = 'Plata';
            visitsNeeded = 16 - visitas;
            progressPercent = (visitas / 16) * 100;
        } else if (visitas < 30) {
            nextLevel = 'Oro';
            visitsNeeded = 30 - visitas;
            progressPercent = ((visitas - 15) / (30 - 15)) * 100;
        } else if (visitas < 60) {
            nextLevel = 'Black';
            visitsNeeded = 60 - visitas;
            progressPercent = ((visitas - 29) / (60 - 29)) * 100;
        } else {
            nextLevel = 'Max';
            visitsNeeded = 0;
            progressPercent = 100;
        }

        const circleStyle = `
            width: 120px; height: 120px; border-radius: 50%; 
            background: radial-gradient(closest-side, white 79%, transparent 80% 100%),
            conic-gradient(#0a3871 ${progressPercent}%, #ddd ${progressPercent}% 100%);
            display: flex; align-items: center; justify-content: center; flex-direction: column;
            margin: 0 auto;
        `;

        resumenDiv.innerHTML = `
            <!-- Dashboard Container -->
            <div style="background:#fff; border:none; border-radius:8px; padding:32px; margin-bottom:32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px; box-shadow:none;">
                <!-- Card Section -->
                <div style="text-align:center; flex:1; min-width:200px;">
                    <div style="font-weight:bold; color:#0a3871; margin-bottom:4px;">${dataDatos.nombreCompleto}</div>
                    <div style="color:#666; font-size:0.9em; margin-bottom:12px;">DNI ${dataDatos.numeroDocumento}</div>
                    <div style="width:220px; height:130px; background:linear-gradient(135deg, #0a3871, #0056b3); border-radius:12px; position:relative; color:white; display:flex; flex-direction:column; justify-content:space-between; padding:16px; box-sizing:border-box; margin:0 auto; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                        <div style="font-weight:bold; font-size:1.2em; text-align:left;">cineplanet<br>socio</div>
                        <div style="font-size:1em; text-align:left;">${currentLevel}</div>
                        <div style="position:absolute; top:16px; right:16px; opacity:0.5; font-size:2em;">●</div>
                    </div>
                    <div style="margin-top:12px; color:#0a3871; font-weight:bold; cursor:pointer; font-size:0.9em;">Ver Tarjeta</div>
                </div>
                <!-- Progress Section -->
                <div style="display:flex; align-items:center; gap:24px; flex:2; justify-content:center; border-left:1px solid #eee; border-right:1px solid #eee; padding:0 20px;">
                    <div style="text-align:center;">
                        <h3 style="color:#0a3871; margin-bottom:16px; margin-top:0;">Mis Visitas</h3>
                        <div style="${circleStyle}">
                            <div style="font-size:0.8em; color:#0a3871;">2025</div>
                            <div style="font-size:2.2em; font-weight:bold; color:#0a3871; line-height:1;">${visitas}</div>
                            <div style="font-size:0.8em; color:#0a3871;">visitas</div>
                        </div>
                    </div>
                    ${visitsNeeded > 0 ? `
                    <div style="text-align:left; max-width:160px;">
                        <div style="font-weight:bold; font-size:1.4em; color:#0a3871;">+${visitsNeeded} Visitas</div>
                        <div style="font-size:0.9em; color:#666; line-height:1.4;">Serás cliente ${nextLevel} en el 2026</div>
                    </div>
                    ` : `
                    <div style="text-align:left; max-width:160px;">
                        <div style="font-weight:bold; font-size:1.4em; color:#0a3871;">¡Felicidades!</div>
                        <div style="font-size:0.9em; color:#666;">Eres socio ${currentLevel}</div>
                    </div>
                    `}
                </div>
                <!-- Points Section -->
                <div style="text-align:center; flex:1; min-width:150px;">
                    <h3 style="color:#0a3871; margin-bottom:16px; margin-top:0;">Mis Puntos</h3>
                    <div style="font-size:2em; font-weight:bold; color:#0a3871;">${parseFloat(dataResumen.puntos).toFixed(2)} pts</div>
                    <div style="color:#666; font-size:0.9em;">Puntos Disponibles</div>
                </div>
            </div>
            <!-- Navigation Buttons -->
            <div style="display:flex; gap:32px; justify-content:center; margin-bottom:40px;">
                <button id="btn-beneficios" style="font-weight:bold; color:#0a3871; border-bottom:3px solid #e4002b; background:none; border-top:none; border-left:none; border-right:none; cursor:pointer; font-size:1.1em; padding-bottom:8px;">Mis Beneficios</button>
                <button id="btn-compras" style="font-weight:bold; color:#0a3871; background:none; border:none; cursor:pointer; font-size:1.1em; padding-bottom:8px;">Mis Compras</button>
                <button id="btn-datos" style="font-weight:bold; color:#0a3871; background:none; border:none; cursor:pointer; font-size:1.1em; padding-bottom:8px;">Mis Datos</button>
            </div>
        `;

        document.getElementById('btn-beneficios').onclick = () => {};
        document.getElementById('btn-compras').onclick = () => window.location.href = 'misCompras.html';
        document.getElementById('btn-datos').onclick = () => window.location.href = 'misDatos.html';

        // Mostrar beneficios de entradas y dulcería
        const beneficiosRes = await fetch(BASE_API_DOMAIN + 'socioBeneficios.php?id=' + id);
        const beneficios = await beneficiosRes.json();

        let html = `<div style="max-width:1100px; margin:40px auto; padding:0 20px; font-family: sans-serif;">`;

        // --- ENTRADAS ---
        html += `
            <h2 style="color:#002a5c; font-size:18px; display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                <i class="fa-solid fa-ticket" style="transform: rotate(-45deg);"></i> Entradas
            </h2>
            <div style="background-color:#fcfcfc; padding:40px; border-radius:4px; display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:40px; margin-bottom:40px;">
        `;

        if (beneficios.entradas && beneficios.entradas.length > 0) {
            beneficios.entradas.forEach(b => {
                html += `
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <h3 style="color:#002a5c; font-size:15px; font-weight:bold; margin:0;">${b.nombre}</h3>
                        <p style="color:#555; font-size:14px; margin:0; line-height:1.5;">${b.descripcion || ''}</p>
                        ${b.tieneStock == 1 ? `<p style="color:#666; font-size:14px; margin:0;">Cantidad: ${b.stock}</p>` : ''}
                        ${b.requierePuntos == 1 ? `<p style="color:#e4002b; font-size:13px; font-weight:bold; margin:0;">Canjea por: ${b.puntosNecesarios} pts</p>` : ''}
                    </div>
                `;
            });
        } else {
            html += `<div style="grid-column: 1/-1; color:#666;">No hay beneficios de entradas disponibles.</div>`;
        }
        html += `</div>`;

        // --- DULCERÍA ---
        html += `
            <h2 style="color:#002a5c; font-size:18px; display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                <i class="fa-solid fa-burger"></i> Dulcería
            </h2>
            <div style="background-color:#fcfcfc; padding:40px; border-radius:4px; display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:40px;">
        `;

        if (beneficios.dulceria && beneficios.dulceria.length > 0) {
            beneficios.dulceria.forEach(d => {
                html += `
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <h3 style="color:#002a5c; font-size:15px; font-weight:bold; margin:0;">${d.nombre}</h3>
                        <p style="color:#555; font-size:14px; margin:0; line-height:1.5;">${d.descripcion || ''}</p>
                        <p style="color:#666; font-size:14px; margin:0;">Precio: S/${parseFloat(d.precio).toFixed(2)}</p>
                        ${d.canjeaPuntos == 1 ? `<p style="color:#e4002b; font-size:13px; font-weight:bold; margin:0;">Canjea por: ${d.puntosNecesarios} pts</p>` : ''}
                    </div>
                `;
            });
        } else {
            html += `<div style="grid-column: 1/-1; color:#666;">No hay beneficios de dulcería disponibles.</div>`;
        }
        html += `</div></div>`;

        resumenDiv.insertAdjacentHTML('afterend', html);

    } catch (e) {
        resumenDiv.innerHTML = '<div>Error al cargar datos</div>';
    }
});
