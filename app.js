document.addEventListener('DOMContentLoaded', () => {

    const consultasPublicas = {
        '12345678': {
            nombre: 'Juan Carlos Pérez Gómez',
            centro: 'Aurora',
            vacunas: [
                { nombre: 'Toxoide Tetánico', dosis: 'Primera Dosis', estado: 'Aplicado' }
            ]
        },
        '87654321': {
            nombre: 'María Alejandra Rodríguez Blanco',
            centro: 'Aurora',
            vacunas: []
        }
    };

    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const user = document.getElementById('username').value.trim().toLowerCase();
            const pass = document.getElementById('password').value.trim();

            if (!user || !pass) {
                alert('Ingrese usuario y contraseña.');
                return;
            }

            if (user.includes('master')) {
                window.location.href = 'master.html';
            } else if (user.includes('subregion')) {
                window.location.href = 'subregion.html';
            } else if (user.includes('vacunador')) {
                window.location.href = 'index.html';
            } else {
                alert('Usuario o contraseña incorrectos.');
            }
        });
    }

    const saveUserBtn = document.getElementById('btn-save-user');
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = document.getElementById('user-name').value.trim();
            const email = document.getElementById('user-email').value.trim();
            const role = document.getElementById('user-role').value;

            if (!name || !email || !role) {
                alert('Complete todos los campos.');
                return;
            }

            const tableBody = document.getElementById('master-user-list');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><strong>${name}</strong></td>
                <td>${email}</td>
                <td><span class="badge-role">${role}</span></td>
                <td><button type="button" class="btn-delete">Eliminar</button></td>
            `;

            newRow.querySelector('.btn-delete').addEventListener('click', () => newRow.remove());
            tableBody.appendChild(newRow);

            document.getElementById('user-name').value = '';
            document.getElementById('user-email').value = '';
            document.getElementById('user-role').value = '';
        });
    }

    const saveCatalogBtn = document.getElementById('btn-save-catalog');
    if (saveCatalogBtn) {
        saveCatalogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const vaccine = document.getElementById('catalog-vaccine').value.trim();
            const dose = document.getElementById('catalog-dose').value.trim();

            if (!vaccine || !dose) {
                alert('Complete los datos del biológico.');
                return;
            }

            const tableBody = document.getElementById('master-catalog-list');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><strong>${vaccine}</strong></td>
                <td>${dose}</td>
                <td><button type="button" class="btn-delete">Eliminar</button></td>
            `;

            newRow.querySelector('.btn-delete').addEventListener('click', () => newRow.remove());
            tableBody.appendChild(newRow);

            document.getElementById('catalog-vaccine').value = '';
            document.getElementById('catalog-dose').value = '';
        });
    }

    const saveSubBtn = document.getElementById('btn-save-sub');
    if (saveSubBtn) {
        saveSubBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const municipality = document.getElementById('sub-municipality')?.value || '';
            const vaccine = document.getElementById('sub-vaccine')?.value || '';
            const doses = document.getElementById('sub-doses')?.value.trim() || '';
            const date = document.getElementById('sub-date')?.value || '';
            const tableBody = document.getElementById('subregion-report-list');

            if (!municipality || !vaccine || !doses || !date) {
                alert('Complete todos los campos del reporte.');
                return;
            }

            if (tableBody) {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td><strong>${municipality}</strong></td>
                    <td>${vaccine}</td>
                    <td>${doses} dosis</td>
                    <td>${date}</td>
                    <td><button type="button" class="btn-delete">Eliminar</button></td>
                `;

                newRow.querySelector('.btn-delete').addEventListener('click', () => newRow.remove());
                tableBody.appendChild(newRow);

                document.getElementById('subregion-form')?.reset();
            }
        });
    }

    function agregarFilaVacuna(tableBody, vacuna, estado, fecha, lote, esPendiente) {
        const badge = esPendiente
            ? '<span class="badge-danger">Pendiente</span>'
            : '<span class="badge-success">Aplicado</span>';

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><strong>${vacuna}</strong></td>
            <td>${badge}</td>
            <td>${fecha}</td>
            <td>${lote}</td>
            <td><button type="button" class="btn-delete">Eliminar</button></td>
        `;

        newRow.querySelector('.btn-delete').addEventListener('click', () => newRow.remove());
        tableBody.appendChild(newRow);
    }

    const addDoseBtn = document.getElementById('btn-add-dose');
    if (addDoseBtn) {
        addDoseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const vaccineSelect = document.getElementById('select-vaccine').value;
            const doseSelect = document.getElementById('select-dose-num').value;
            const dateInput = document.getElementById('input-date').value;
            const lotInput = document.getElementById('input-lot').value.trim();
            const tableBody = document.getElementById('dynamic-vaccine-list');

            if (!vaccineSelect || !dateInput || !lotInput || !tableBody) {
                alert('Seleccione vacuna, fecha y lote.');
                return;
            }

            const etiqueta = `${vaccineSelect} (${doseSelect})`;
            agregarFilaVacuna(tableBody, etiqueta, 'Aplicado', dateInput, lotInput, false);

            document.getElementById('select-vaccine').value = '';
            document.getElementById('input-date').value = '';
            document.getElementById('input-lot').value = '';
        });
    }

    const addPendingBtn = document.getElementById('btn-add-pending');
    if (addPendingBtn) {
        addPendingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const vaccineSelect = document.getElementById('select-vaccine-pending').value;
            const doseSelect = document.getElementById('select-dose-num-pending').value;
            const dateInput = document.getElementById('input-date-pending').value || '—';
            const noteInput = document.getElementById('input-lot-pending').value.trim() || '—';
            const tableBody = document.getElementById('dynamic-vaccine-list');

            if (!vaccineSelect || !tableBody) {
                alert('Seleccione la vacuna pendiente.');
                return;
            }

            const etiqueta = `${vaccineSelect} (${doseSelect})`;
            agregarFilaVacuna(tableBody, etiqueta, 'Pendiente', dateInput, noteInput, true);

            document.getElementById('select-vaccine-pending').value = '';
            document.getElementById('input-date-pending').value = '';
            document.getElementById('input-lot-pending').value = '';
        });
    }

    const searchPublicBtn = document.getElementById('btn-search-public');
    if (searchPublicBtn) {
        searchPublicBtn.addEventListener('click', () => {
            const docInput = document.getElementById('search-document').value.trim().replace(/\D/g, '');
            const resultCard = document.getElementById('public-result-card');
            const resCedula = document.getElementById('res-cedula');
            const resNombre = document.getElementById('res-nombre');
            const resCentro = document.getElementById('res-centro');
            const resEstatus = document.getElementById('res-estatus');
            const vaccineList = document.getElementById('public-vaccine-list');

            if (!docInput) {
                alert('Ingrese un número de cédula.');
                return;
            }

            const registro = consultasPublicas[docInput];

            if (resCedula) {
                resCedula.textContent = docInput;
            }

            if (!registro) {
                if (resultCard) {
                    resultCard.classList.remove('is-hidden');
                }
                if (resNombre) resNombre.textContent = 'No registrado';
                if (resCentro) resCentro.textContent = '—';
                if (resEstatus) {
                    resEstatus.textContent = 'Sin datos';
                    resEstatus.className = 'badge-danger';
                }
                if (vaccineList) {
                    vaccineList.innerHTML = '<tr><td colspan="3">No hay vacunas registradas para esta cédula.</td></tr>';
                }
                return;
            }

            if (resultCard) {
                resultCard.classList.remove('is-hidden');
            }
            if (resNombre) {
                resNombre.textContent = registro.nombre;
            }
            if (resCentro) {
                resCentro.textContent = registro.centro;
            }
            if (resEstatus) {
                if (registro.vacunas.length > 0) {
                    resEstatus.textContent = 'Con dosis registradas';
                    resEstatus.className = 'badge-ok';
                } else {
                    resEstatus.textContent = 'Sin dosis registradas';
                    resEstatus.className = 'badge-warning';
                }
            }
            if (vaccineList) {
                if (registro.vacunas.length === 0) {
                    vaccineList.innerHTML = '<tr><td colspan="3">No hay vacunas registradas.</td></tr>';
                } else {
                    vaccineList.innerHTML = registro.vacunas.map((item) => `
                        <tr>
                            <td><strong>${item.nombre}</strong></td>
                            <td>${item.dosis}</td>
                            <td><span class="badge-success">${item.estado}</span></td>
                        </tr>
                    `).join('');
                }
            }
        });
    }

});
