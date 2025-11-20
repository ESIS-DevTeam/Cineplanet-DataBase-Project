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

    // Validación de nombre y correo antes de enviar cualquier formulario de pago
    const pagoForms = document.querySelectorAll('details[id^="pago-"] form');
    const warningDiv = document.getElementById('pago-warning');
    pagoForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            const nombreInput = document.querySelector('input[name="nombreCompleto"]');
            const emailInput = document.querySelector('input[name="correoElectronico"]');
            if (!nombreInput.value.trim() || !emailInput.value.trim()) {
                if (warningDiv) {
                    warningDiv.textContent = 'Debe llenar el Nombre Completo y el Correo Electrónico para continuar con el pago.';
                    warningDiv.style.display = 'block';
                }
                e.preventDefault();
                return false;
            } else if (warningDiv) {
                warningDiv.textContent = '';
                warningDiv.style.display = 'none';
            }

            e.preventDefault();

            // Recopilar datos
            const tipoDocumento = form.querySelector('select[name="tipoDocumento"]').value;
            const numeroDocumento = form.querySelector('input[name="numeroDocumento"]').value;
            const payloadVerificar = {
                nombreCompleto: nombreInput.value,
                correoElectronico: emailInput.value,
                tipoDocumento,
                numeroDocumento
            };

            // Verificar documento antes de pagar
            try {
                const resVerificar = await fetch('../../backend/api/verificarDocumento.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadVerificar)
                });
                const resultVerificar = await resVerificar.json();
                if (resultVerificar.status === 'socio') {
                    alert(resultVerificar.message);
                    return;
                }
                // Si usuario existe o fue insertado, continuar con el pago normal
                // ...aquí iría la lógica para enviar el pago (como antes)...
            } catch {
                alert('❌ Error al verificar el documento');
                return;
            }
        });
    });
});
