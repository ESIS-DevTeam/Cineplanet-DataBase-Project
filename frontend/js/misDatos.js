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

        const res = await fetch(BASE_API_DOMAIN + 'socioResumenSimple.php?id=' + id);
        const data = await res.json();
        if (data.error) {
            datosDiv.innerHTML = '<div style="color:red;">No autenticado (no hay resumen)</div>';
            return;
        }
        datosDiv.innerHTML = `
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
            <div id="botones-socio" style="display:flex; gap:32px; justify-content:center;">
                <button id="btn-beneficios" style="font-weight:bold; color:#0a3871;">Mis Beneficios</button>
                <button id="btn-compras" style="font-weight:bold; color:#0a3871;">Mis Compras</button>
                <button id="btn-datos" style="font-weight:bold; color:#0a3871; border-bottom:3px solid #e4002b;">Mis Datos</button>
            </div>
        `;
        // Asignar eventos después de crear los botones
        const btnBeneficios = document.getElementById('btn-beneficios');
        const btnCompras = document.getElementById('btn-compras');
        const btnDatos = document.getElementById('btn-datos');
        if (btnBeneficios) btnBeneficios.onclick = () => window.location.href = 'misBeneficos.html';
        if (btnCompras) btnCompras.onclick = () => window.location.href = 'misCompras.html';
        if (btnDatos) btnDatos.onclick = () => {};

        // Mostrar los datos completos del socio
        const datosRes = await fetch(BASE_API_DOMAIN + 'socioDatos.php?id=' + id);
        const datos = await datosRes.json();
        console.log('Datos socio:', datos);
        if (datos.error) {
            datosDiv.innerHTML += `<div style="color:red;">${datos.error}</div>`;
            return;
        }

        datosDiv.innerHTML += `
            <h2>Datos de Socio Cineplanet</h2>
            <div>
                <strong>Nombre Completo:</strong> ${datos.nombreCompleto}<br>
                <strong>Tipo de documento:</strong> ${datos.tipoDocumento}<br>
                <strong>Número de documento:</strong> ${datos.numeroDocumento}<br>
                <strong>Fecha de nacimiento:</strong> ${datos.fechaNacimiento}<br>
                <strong>Género:</strong> ${datos.genero}<br>
            </div>
            <hr>
            <h2>Datos de Contacto</h2>
            <div>
                <strong>Teléfono de contacto:</strong> ${datos.celular}<br>
                <strong>Departamento:</strong> ${datos.departamento}<br>
                <strong>Provincia:</strong> ${datos.provincia}<br>
                <strong>Distrito:</strong> ${datos.distrito}<br>
                <strong>Tu Cineplanet favorito:</strong> ${datos.cineplanetFavorito || ''}<br>
                <strong>Correo electrónico:</strong> ${datos.email}<br>
            </div>
        `;
        // Asignar eventos después de modificar el innerHTML final
        const btnBeneficiosFinal = document.getElementById('btn-beneficios');
        const btnComprasFinal = document.getElementById('btn-compras');
        const btnDatosFinal = document.getElementById('btn-datos');
        if (btnBeneficiosFinal) btnBeneficiosFinal.onclick = () => window.location.href = 'misBeneficos.html';
        if (btnComprasFinal) btnComprasFinal.onclick = () => window.location.href = 'misCompras.html';
        if (btnDatosFinal) btnDatosFinal.onclick = () => {};
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
