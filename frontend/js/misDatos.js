import BASE_API_DOMAIN from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Cambia este id para solo modificar los datos del socio
    const datosDiv = document.getElementById('datos-socio');
    try {
        const sessionRes = await fetch(BASE_API_DOMAIN.replace('/api/', '/auth/') + 'checkSession.php');
        const sessionData = await sessionRes.json();
        const id = sessionData?.socio?.id;
        console.log('ID de socio obtenido de la sesión:', id);
        window.socioId = id;

        if (!id) {
            datosDiv.innerHTML = '<div style="color:red;">No autenticado (no hay sesión)</div>';
            return;
        }

        // Obtener resumen y datos completos simultáneamente para armar el dashboard
        const [resumenRes, datosRes] = await Promise.all([
            fetch(BASE_API_DOMAIN + 'socioResumenSimple.php?id=' + id),
            fetch(BASE_API_DOMAIN + 'socioDatos.php?id=' + id)
        ]);

        const dataResumen = await resumenRes.json();
        const dataDatos = await datosRes.json();

        if (dataResumen.error || dataDatos.error) {
            datosDiv.innerHTML = '<div style="color:red;">No se pudo cargar la información del socio.</div>';
            return;
        }

        // Lógica de niveles y progreso
        const visitas = parseInt(dataResumen.visitas) || 0;
        let nextLevel = '';
        let visitsNeeded = 0;
        let progressPercent = 0;
        const currentLevel = dataResumen.grado || 'Clásico';

        if (visitas < 16) {
            // Clásico (0-15) -> Plata (16)
            nextLevel = 'Plata';
            visitsNeeded = 16 - visitas;
            progressPercent = (visitas / 16) * 100;
        } else if (visitas < 30) {
            // Plata (16-29) -> Oro (30)
            nextLevel = 'Oro';
            visitsNeeded = 30 - visitas;
            progressPercent = ((visitas - 15) / (30 - 15)) * 100;
        } else if (visitas < 60) {
            // Oro (30-59) -> Black (60)
            nextLevel = 'Black';
            visitsNeeded = 60 - visitas;
            progressPercent = ((visitas - 29) / (60 - 29)) * 100;
        } else {
            // Black (60+)
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

        datosDiv.innerHTML = `
            <!-- Dashboard Container -->
            <div style="width:100%; background:#fff; border:none; border-radius:8px; padding:32px; margin-bottom:32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px; box-shadow:none;">
                
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
            <div id="botones-socio" style="width:100%; display:flex; gap:32px; justify-content:center; margin-bottom:40px;">
                <button id="btn-beneficios" style="font-weight:bold; color:#0a3871; background:none; border:none; cursor:pointer; font-size:1.1em; padding-bottom:8px;">Mis Beneficios</button>
                <button id="btn-compras" style="font-weight:bold; color:#0a3871; background:none; border:none; cursor:pointer; font-size:1.1em; padding-bottom:8px;">Mis Compras</button>
                <button id="btn-datos" style="font-weight:bold; color:#0a3871; border-bottom:3px solid #e4002b; background:none; border-top:none; border-left:none; border-right:none; cursor:pointer; font-size:1.1em; padding-bottom:8px;">Mis Datos</button>
            </div>

            <!-- Form Container -->
            <div style="width:100%; text-align:left; font-family: 'Segoe UI', sans-serif;">
                <h2 style="color:#002a5c; font-size:1.2rem; margin-bottom:1rem;">Datos de Socio Cineplanet</h2>
                
                <div style="background-color:#f8f9fa; padding:20px; border-radius:4px; font-size:0.9rem; color:#555; margin-bottom:30px;">
                    La información que te identifica como cliente de Cineplanet no puede ser editada. Si alguno de los datos no es correcto o quieres cambiarlo, escríbenos a <a href="#" style="color:#002a5c; text-decoration:underline;">Contáctanos</a>.
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:30px; margin-bottom:40px;">
                    <div>
                        <div style="font-size:0.8rem; color:#999; margin-bottom:5px;">Nombre Completo</div>
                        <div style="font-size:1rem; color:#555; font-weight:500;">${dataDatos.nombreCompleto}</div>
                    </div>
                    <div>
                        <div style="font-size:0.8rem; color:#999; margin-bottom:5px;">Tipo de documento</div>
                        <div style="font-size:1rem; color:#555; font-weight:500;">${dataDatos.tipoDocumento}</div>
                    </div>
                    <div>
                        <div style="font-size:0.8rem; color:#999; margin-bottom:5px;">Número de documento</div>
                        <div style="font-size:1rem; color:#555; font-weight:500;">${dataDatos.numeroDocumento}</div>
                    </div>
                    <div>
                        <div style="font-size:0.8rem; color:#999; margin-bottom:5px;">Fecha de nacimiento</div>
                        <div style="font-size:1rem; color:#555; font-weight:500;">${dataDatos.fechaNacimiento}</div>
                    </div>
                    <div>
                        <div style="font-size:0.8rem; color:#999; margin-bottom:5px;">Género</div>
                        <div style="font-size:1rem; color:#555; font-weight:500;">${dataDatos.genero}</div>
                    </div>
                </div>

                <hr style="border:0; border-top:1px solid #ddd; margin-bottom:30px;">

                <h2 style="color:#002a5c; font-size:1.2rem; margin-bottom:20px;">Datos de Contacto</h2>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:30px; margin-bottom:30px;">
                    <!-- Teléfono -->
                    <div>
                        <label style="display:block; font-size:0.8rem; color:#666; margin-bottom:5px;">Teléfono de contacto</label>
                        <input type="text" value="${dataDatos.celular}" style="width:100%; padding:8px 0; border:none; border-bottom:1px solid #ccc; font-size:1rem; color:#333; outline:none;">
                    </div>
                    <!-- Dirección -->
                    <div>
                        <label style="display:block; font-size:0.8rem; color:#666; margin-bottom:5px;">Dirección</label>
                        <input type="text" value="" style="width:100%; padding:8px 0; border:none; border-bottom:1px solid #ccc; font-size:1rem; color:#333; outline:none;">
                    </div>
                    <!-- Estado Civil -->
                    <div>
                        <label style="display:block; font-size:0.8rem; color:#666; margin-bottom:5px;">Estado civil</label>
                        <select style="width:100%; padding:8px 0; border:none; border-bottom:1px solid #ccc; font-size:1rem; color:#333; outline:none; background:white;">
                            <option selected>Soltero(a)</option>
                            <option>Casado(a)</option>
                        </select>
                    </div>
                    <!-- Departamento -->
                    <div>
                        <label style="display:block; font-size:0.8rem; color:#666; margin-bottom:5px;">Departamento</label>
                        <select style="width:100%; padding:8px 0; border:none; border-bottom:1px solid #ccc; font-size:1rem; color:#333; outline:none; background:white;">
                            <option selected>${dataDatos.departamento}</option>
                        </select>
                    </div>
                    <!-- Provincia -->
                    <div>
                        <label style="display:block; font-size:0.8rem; color:#666; margin-bottom:5px;">Provincia</label>
                        <select style="width:100%; padding:8px 0; border:none; border-bottom:1px solid #ccc; font-size:1rem; color:#333; outline:none; background:white;">
                            <option selected>${dataDatos.provincia}</option>
                        </select>
                    </div>
                    <!-- Distrito -->
                    <div>
                        <label style="display:block; font-size:0.8rem; color:#666; margin-bottom:5px;">Distrito</label>
                        <select style="width:100%; padding:8px 0; border:none; border-bottom:1px solid #ccc; font-size:1rem; color:#333; outline:none; background:white;">
                            <option selected>${dataDatos.distrito}</option>
                        </select>
                    </div>
                    <!-- Cineplanet Favorito -->
                    <div>
                        <label style="display:block; font-size:0.8rem; color:#666; margin-bottom:5px;">Tu Cineplanet favorito</label>
                        <select style="width:100%; padding:8px 0; border:none; border-bottom:1px solid #ccc; font-size:1rem; color:#333; outline:none; background:white;">
                            <option selected>${dataDatos.cineplanetFavorito || 'Seleccionar'}</option>
                        </select>
                    </div>
                    <!-- Email -->
                    <div>
                        <label style="display:block; font-size:0.8rem; color:#666; margin-bottom:5px;">Correo electrónico</label>
                        <input type="text" value="${dataDatos.email}" style="width:100%; padding:8px 0; border:none; border-bottom:1px solid #ccc; font-size:1rem; color:#333; outline:none;">
                    </div>
                </div>

                <div style="margin-bottom:30px; display:flex; align-items:flex-start; gap:10px;">
                    <input type="checkbox" checked style="margin-top:4px;">
                    <span style="font-size:0.85rem; color:#333;">Acepto recibir promociones, descuentos y publicidad de Cineplanet mediante el uso de datos personales brindados</span>
                </div>

                <div style="text-align:center; margin-bottom:40px;">
                    <button style="background-color:#ccc; color:white; border:none; padding:10px 30px; border-radius:20px; font-weight:bold; cursor:default;">Guardar Datos</button>
                </div>
            </div>
        `;

        // Asignar eventos después de crear los botones
        const btnBeneficios = document.getElementById('btn-beneficios');
        const btnCompras = document.getElementById('btn-compras');
        const btnDatos = document.getElementById('btn-datos');
        if (btnBeneficios) btnBeneficios.onclick = () => window.location.href = 'misBeneficos.html';
        if (btnCompras) btnCompras.onclick = () => window.location.href = 'misCompras.html';
        if (btnDatos) btnDatos.onclick = () => {};

    } catch (e) {
        datosDiv.innerHTML = '<div style="color:red;">Error al cargar datos</div>';
        console.error(e);
    }

    // Manejo del formulario de cambio de contraseña
    const formPass = document.getElementById('form-cambiar-pass');
    if (formPass) {
        formPass.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nueva = document.getElementById('nueva-pass').value;
            const confirmar = document.getElementById('confirmar-pass').value;
            const msg = document.getElementById('msg-pass');
            msg.textContent = '';
            if (!nueva || !confirmar) {
                msg.textContent = 'Completa ambos campos.';
                return;
            }
            if (nueva !== confirmar) {
                msg.textContent = 'Las contraseñas no coinciden.';
                return;
            }
            const id = window.socioId || null;
            if (!id) {
                msg.textContent = 'No autenticado.';
                return;
            }
            document.getElementById('btn-guardar-pass').disabled = true;
            try {
                const res = await fetch(BASE_API_DOMAIN + 'cambiarPassword.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, password: nueva })
                });
                const data = await res.json();
                if (data.success) {
                    msg.style.color = 'green';
                    msg.textContent = 'Contraseña actualizada correctamente.';
                } else {
                    msg.style.color = '#e4002b';
                    msg.textContent = data.error || 'Error al actualizar.';
                }
            } catch (err) {
                msg.style.color = '#e4002b';
                msg.textContent = 'Error de red.';
            }
            document.getElementById('btn-guardar-pass').disabled = false;
        });
    }
});
