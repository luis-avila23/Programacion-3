document.addEventListener('DOMContentLoaded', () => {

    // Base de datos simulada en memoria sincronizada con la Subregión y Consulta
    const consultasPublicas = {
        '12345678': {
            firstname1: 'Juan',
            firstname2: 'Carlos',
            lastname1: 'Pérez',
            lastname2: 'Gómez',
            municipality: 'Roscio',
            bloodType: 'O+',
            condition: 'Apto para Manipulación de Alimentos',
            expiry: '2027-11-15',
            centro: 'Aurora',
            vacunas: [
                { nombre: 'Toxoide Tetánico', dosis: 'Primera Dosis', estado: 'Aplicado' }
            ]
        },
        '87654321': {
            firstname1: 'María',
            firstname2: 'Alejandra',
            lastname1: 'Rodríguez',
            lastname2: 'Blanco',
            municipality: 'Infante',
            bloodType: 'A+',
            condition: 'Apto Laboral',
            expiry: '2027-06-30',
            centro: 'Aurora',
            vacunas: []
        }
    };

    // ==========================================
    // 1. AUTENTICACIÓN
    // ==========================================
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

    // ==========================================
    // 2. PANEL MASTER: GESTIÓN DE USUARIOS
    // ==========================================
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

    // ==========================================
    // 3. PANEL MASTER: CATÁLOGO DE VACUNAS
    // ==========================================
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

    // ==========================================
    // 4. MÓDULO SUBREGIÓN: EMISIÓN DE CARNET DE SALUD
    // ==========================================
    const citizenCedulaInput = document.getElementById('citizen-cedula');
    if (citizenCedulaInput) {
        citizenCedulaInput.addEventListener('blur', () => {
            const cedula = citizenCedulaInput.value.trim().replace(/\D/g, '');
            const registro = consultasPublicas[cedula];

            if (registro) {
                const f1 = document.getElementById('citizen-first-name');
                const f2 = document.getElementById('citizen-second-name');
                const l1 = document.getElementById('citizen-first-lastname');
                const l2 = document.getElementById('citizen-second-lastname');
                const muni = document.getElementById('citizen-municipality');
                const blood = document.getElementById('health-blood-type');

                if (f1) f1.value = registro.firstname1 || '';
                if (f2) f2.value = registro.firstname2 || '';
                if (l1) l1.value = registro.lastname1 || '';
                if (l2) l2.value = registro.lastname2 || '';
                if (muni) muni.value = registro.municipality || '';
                if (blood && registro.bloodType) blood.value = registro.bloodType;
            }
        });
    }

    const saveHealthCardBtn = document.getElementById('btn-save-health-card');
    if (saveHealthCardBtn) {
        saveHealthCardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const cedula = document.getElementById('citizen-cedula')?.value.trim();
            const f1 = document.getElementById('citizen-first-name')?.value.trim();
            const l1 = document.getElementById('citizen-first-lastname')?.value.trim();
            const bloodType = document.getElementById('health-blood-type')?.value;
            const condition = document.getElementById('health-condition')?.value;
            const expiry = document.getElementById('health-expiry')?.value;
            const tableBody = document.getElementById('health-card-list');

            if (!cedula || !f1 || !l1 || !bloodType || !condition || !expiry) {
                alert('Por favor complete los campos obligatorios del ciudadano y del carnet.');
                return;
            }

            if (tableBody) {
                const nombreCompleto = `${f1} ${l1}`;
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td><strong>${cedula}</strong></td>
                    <td>${nombreCompleto}</td>
                    <td><span class="badge-role">${bloodType}</span></td>
                    <td>${condition}</td>
                    <td>${expiry}</td>
                    <td><button type="button" class="btn-delete">Eliminar</button></td>
                `;

                newRow.querySelector('.btn-delete').addEventListener('click', () => newRow.remove());
                tableBody.appendChild(newRow);

                document.getElementById('subregion-form')?.reset();
            }
        });
    }

    // ==========================================
    // 5. MÓDULO CONSULTA PÚBLICA (CONSULTA.HTML)
    // ==========================================
    const searchPublicBtn = document.getElementById('btn-search-public');
    if (searchPublicBtn) {
        searchPublicBtn.addEventListener('click', () => {
            const docInput = document.getElementById('search-document').value.trim().replace(/\D/g, '');
            const resultCard = document.getElementById('public-result-card');
            const resCedula = document.getElementById('res-cedula');
            const resNombre = document.getElementById('res-nombre');
            const resMuni = document.getElementById('res-municipality');
            const resBlood = document.getElementById('res-blood-type');
            const resCondition = document.getElementById('res-condition');
            const resExpiry = document.getElementById('res-expiry');
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
                if (resultCard) resultCard.classList.remove('is-hidden');
                if (resNombre) resNombre.textContent = 'No registrado';
                if (resMuni) resMuni.textContent = '—';
                if (resBlood) resBlood.textContent = '—';
                if (resCondition) resCondition.textContent = '—';
                if (resExpiry) resExpiry.textContent = '—';
                if (resEstatus) {
                    resEstatus.textContent = 'Sin datos en el sistema';
                    resEstatus.className = 'badge-danger';
                }
                if (vaccineList) {
                    vaccineList.innerHTML = '<tr><td colspan="3">No hay registros asociados a esta cédula.</td></tr>';
                }
                return;
            }

            if (resultCard) resultCard.classList.remove('is-hidden');
            if (resNombre) {
                resNombre.textContent = `${registro.firstname1} ${registro.firstname2 || ''} ${registro.lastname1} ${registro.lastname2 || ''}`.trim();
            }
            if (resMuni) resMuni.textContent = registro.municipality || '—';
            if (resBlood) resBlood.textContent = registro.bloodType || 'No asignado';
            if (resCondition) resCondition.textContent = registro.condition || 'Pendiente de validación';
            if (resExpiry) resExpiry.textContent = registro.expiry || '—';

            if (resEstatus) {
                if (registro.condition && registro.bloodType) {
                    resEstatus.textContent = 'Carnet de Salud Emitido y Vigente';
                    resEstatus.className = 'badge-success';
                } else {
                    resEstatus.textContent = 'En proceso de validación subregional';
                    resEstatus.className = 'badge-warning';
                }
            }

            if (vaccineList) {
                if (!registro.vacunas || registro.vacunas.length === 0) {
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