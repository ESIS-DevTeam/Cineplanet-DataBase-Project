document.addEventListener('DOMContentLoaded', async () => {
    // Autocompletar datos si hay sesión
    try {
        const res = await fetch('../../backend/auth/checkSession.php');
        const data = await res.json();
        if (data.loggedIn && data.socio) {
            const socio = data.socio;
            // Nombre completo
            const nombreInput = document.querySelector('input[name="nombreCompleto"]');
            if (nombreInput) {
                nombreInput.value = socio.nombre + ' ' + (socio.apellidoPaterno || '') + ' ' + (socio.apellidoMaterno || '');
                nombreInput.readOnly = true;
            }
            // Correo electrónico
            const emailInput = document.querySelector('input[name="correoElectronico"]');
            if (emailInput) {
                emailInput.value = socio.email || '';
                emailInput.readOnly = true;
            }
            // Número de documento
            const docInput = document.querySelectorAll('input[name="numeroDocumento"]');
            docInput.forEach(input => {
                input.value = socio.numeroDocumento || '';
                input.readOnly = true;
            });
            // Celular
            const celularInput = document.querySelectorAll('input[name="celular"]');
            celularInput.forEach(input => {
                input.value = socio.celular || '';
                input.readOnly = true;
            });
        }
    } catch {
        // No autocompletar si falla
    }

    // Solo un details abierto a la vez
    const detailsList = document.querySelectorAll('details[id^="pago-"]');
    detailsList.forEach(details => {
        details.addEventListener('toggle', function() {
            if (details.open) {
                detailsList.forEach(d => {
                    if (d !== details) d.open = false;
                });
            }
        });
    });
});
