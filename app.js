document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DEL LOGIN (login.html) ---
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const user = document.getElementById('username').value.trim().toLowerCase();
            const pass = document.getElementById('password').value.trim();

            if (!user || !pass) {
                alert('Por favor, ingrese el usuario y la contraseña.');
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


    // --- 2. LÓGICA DE REGISTRO DE USUARIOS (master.html) ---
    const saveUserBtn = document.getElementById('btn-save-user');
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = document.getElementById('user-name').value.trim();
            const email = document.getElementById('user-email').value.trim();
            const role = document.getElementById('user-role').value;

            if (!name || !email || !role) {
                alert('Por favor, complete todos los campos para registrar el usuario.');
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


    // --- 3. LÓGICA DE CATÁLOGO DE VACUNAS (master.html) ---
    const saveCatalogBtn = document.getElementById('btn-save-catalog');
    if (saveCatalogBtn) {
        saveCatalogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const vaccine = document.getElementById('catalog-vaccine').value.trim();
            const dose = document.getElementById('catalog-dose').value.trim();

            if (!vaccine || !dose) {
                alert('Por favor, complete los datos del biológico.');
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


    // --- 4. LÓGICA DE REPORTE SUBREGIÓN (subregion.html) ---
    const saveSubBtn = document.getElementById('btn-save-sub');
    if (saveSubBtn) {
        saveSubBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const municipality = document.getElementById('sub-municipality') ? document.getElementById('sub-municipality').value : '';
            const vaccine = document.getElementById('sub-vaccine') ? document.getElementById('sub-vaccine').value : '';
            const doses = document.getElementById('sub-doses') ? document.getElementById('sub-doses').value.trim() : '';
            const date = document.getElementById('sub-date') ? document.getElementById('sub-date').value : '';

            const tableBody = document.getElementById('subregion-report-list');

            if (!municipality || !vaccine || !doses || !date) {
                alert('Por favor, complete todos los campos del reporte.');
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

                const formSub = document.getElementById('subregion-form');
                if (formSub) formSub.reset();
            }
        });
    }


    // --- 5. LÓGICA DE EXPEDIENTE Y VACUNAS (index.html) ---
    const addDoseBtn = document.getElementById('btn-add-dose');
    if (addDoseBtn) {
        addDoseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const vaccineSelect = document.getElementById('select-vaccine').value;
            const dateInput = document.getElementById('input-date').value;
            const lotInput = document.getElementById('input-lot').value.trim();

            if (!vaccineSelect || !dateInput || !lotInput) {
                alert('Por favor, seleccione una vacuna, ingrese la fecha y el número de lote.');
                return;
            }

            const tableBody = document.getElementById('dynamic-vaccine-list');
            if (tableBody) {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td><strong>${vaccineSelect}</strong></td>
                    <td><span class="badge-success">Aplicado</span></td>
                    <td>${dateInput}</td>
                    <td>${lotInput}</td>
                    <td><button type="button" class="btn-delete">Eliminar</button></td>
                `;

                newRow.querySelector('.btn-delete').addEventListener('click', () => newRow.remove());
                tableBody.appendChild(newRow);

                document.getElementById('select-vaccine').value = '';
                document.getElementById('input-date').value = '';
                document.getElementById('input-lot').value = '';
            }
        });
    }


    // --- 6. LÓGICA DE CONSULTA PÚBLICA (consulta.html) ---
    const searchPublicBtn = document.getElementById('btn-search-public');
    if (searchPublicBtn) {
        searchPublicBtn.addEventListener('click', () => {
            // Se conecta con el ID 'search-document' que se puso en el input de consulta
            const docInput = document.getElementById('search-document').value.trim();
            const resultCard = document.getElementById('public-result-card');

            if (!docInput) {
                alert('Por favor, ingrese un número de cédula para consultar.');
                return;
            }

            if (resultCard) {
                // Muestra la tarjeta de resultados
                resultCard.style.display = 'block';
                // Rinde el texto de la cédula ingresada en el resultado
                const resCedula = document.getElementById('res-cedula');
                if (resCedula) {
                    resCedula.textContent = docInput;
                }
            }
        });
    }

});