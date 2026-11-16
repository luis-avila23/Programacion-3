document.addEventListener('DOMContentLoaded', () => {

    const paginasPorRol = {
        Master: 'master.html',
        Subregion: 'subregion.html',
        Vacunador: 'index.html'
    };

    let avisoConexion = false;

    function esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function avisar(err) {
        if (avisoConexion) {
            return;
        }
        avisoConexion = true;
        alert(err.message || 'No se pudo conectar con la base de datos local.');
    }

    async function api(url, payload) {
        let response;
        try {
            response = await fetch(url, payload ? {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            } : undefined);
        } catch (err) {
            throw new Error('No se pudo conectar con la base de datos. Abra el proyecto en http://localhost/sivan/ con Apache y MySQL activos en XAMPP.');
        }

        let data = null;
        try {
            data = await response.json();
        } catch (err) {
            data = null;
        }

        if (!response.ok || !data || data.ok === false) {
            throw new Error((data && data.error) || 'No se pudo completar la operación.');
        }

        return data;
    }

    // ==========================================
    // 1. AUTENTICACIÓN
    // ==========================================
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const user = document.getElementById('username').value.trim().toLowerCase();
            const pass = document.getElementById('password').value.trim();

            if (!user || !pass) {
                alert('Ingrese usuario y contraseña.');
                return;
            }

            try {
                const data = await api('api/login.php', { username: user, password: pass });
                const pagina = paginasPorRol[data.rol];
                if (!pagina) {
                    alert('Usuario o contraseña incorrectos.');
                    return;
                }
                window.location.href = pagina;
            } catch (err) {
                alert(err.message);
            }
        });
    }

    // ==========================================
    // 2. PANEL MASTER: GESTIÓN DE USUARIOS
    // ==========================================
    const saveUserBtn = document.getElementById('btn-save-user');
    const userTableBody = document.getElementById('master-user-list');

    function filaUsuario(usuario) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><strong>${esc(usuario.nombre)}</strong></td>
            <td>${esc(usuario.correo)}</td>
            <td><span class="badge-role">${esc(usuario.rol)}</span></td>
            <td><button type="button" class="btn-delete">Eliminar</button></td>
        `;

        newRow.querySelector('.btn-delete').addEventListener('click', async () => {
            try {
                await api('api/usuarios.php', { accion: 'eliminar', id: usuario.id });
                newRow.remove();
            } catch (err) {
                alert(err.message);
            }
        });

        return newRow;
    }

    if (saveUserBtn && userTableBody) {
        api('api/usuarios.php')
            .then((data) => {
                data.usuarios.forEach((usuario) => userTableBody.appendChild(filaUsuario(usuario)));
            })
            .catch(avisar);

        saveUserBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const name = document.getElementById('user-name').value.trim();
            const email = document.getElementById('user-email').value.trim();
            const role = document.getElementById('user-role').value;

            if (!name || !email || !role) {
                alert('Complete todos los campos.');
                return;
            }

            try {
                const data = await api('api/usuarios.php', {
                    nombre: name,
                    correo: email,
                    rol: role
                });
                userTableBody.appendChild(filaUsuario(data.usuario));
                document.getElementById('user-name').value = '';
                document.getElementById('user-email').value = '';
                document.getElementById('user-role').value = '';
            } catch (err) {
                alert(err.message);
            }
        });
    }

    // ==========================================
    // 3. PANEL MASTER: CATÁLOGO DE VACUNAS
    // ==========================================
    const saveCatalogBtn = document.getElementById('btn-save-catalog');
    const catalogTableBody = document.getElementById('master-catalog-list');

    function filaCatalogo(vacuna) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><strong>${esc(vacuna.nombre)}</strong></td>
            <td>${esc(vacuna.esquema)}</td>
            <td><button type="button" class="btn-delete">Eliminar</button></td>
        `;

        newRow.querySelector('.btn-delete').addEventListener('click', async () => {
            try {
                await api('api/vacunas.php', { accion: 'eliminar', id: vacuna.id });
                newRow.remove();
            } catch (err) {
                alert(err.message);
            }
        });

        return newRow;
    }

    function agregarOpcionVacuna(selectId, nombre) {
        const select = document.getElementById(selectId);
        if (!select || [...select.options].some((option) => option.value === nombre)) {
            return;
        }
        const option = document.createElement('option');
        option.value = nombre;
        option.textContent = nombre;
        select.appendChild(option);
    }

    if (saveCatalogBtn && catalogTableBody) {
        api('api/vacunas.php')
            .then((data) => {
                data.vacunas.forEach((vacuna) => catalogTableBody.appendChild(filaCatalogo(vacuna)));
            })
            .catch(avisar);

        saveCatalogBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const vaccine = document.getElementById('catalog-vaccine').value.trim();
            const dose = document.getElementById('catalog-dose').value.trim();

            if (!vaccine || !dose) {
                alert('Complete los datos del biológico.');
                return;
            }

            try {
                const data = await api('api/vacunas.php', { nombre: vaccine, esquema: dose });
                catalogTableBody.appendChild(filaCatalogo(data.vacuna));
                document.getElementById('catalog-vaccine').value = '';
                document.getElementById('catalog-dose').value = '';
            } catch (err) {
                alert(err.message);
            }
        });
    }

    const auditList = document.getElementById('audit-list');
    if (auditList) {
        api('api/auditoria.php')
            .then((data) => {
                if (!data.filas.length) {
                    auditList.innerHTML = '<tr><td colspan="5">No hay dosis registradas.</td></tr>';
                    return;
                }
                auditList.innerHTML = data.filas.map((fila) => `
                    <tr>
                        <td>${esc(fila.estado)}</td>
                        <td>${esc(fila.municipio)}</td>
                        <td>${esc(fila.total)}</td>
                        <td>${esc(fila.sistema)}</td>
                        <td>${esc(fila.accion)}</td>
                    </tr>
                `).join('');
            })
            .catch(avisar);
    }

    // ==========================================
    // 4. MÓDULO SUBREGIÓN: EMISIÓN DE CARNET DE SALUD
    // ==========================================
    const citizenCedulaInput = document.getElementById('citizen-cedula');
    if (citizenCedulaInput) {
        citizenCedulaInput.addEventListener('blur', async () => {
            const cedula = citizenCedulaInput.value.trim().replace(/\D/g, '');
            if (!cedula) {
                return;
            }

            try {
                const data = await api('api/personas.php?cedula=' + encodeURIComponent(cedula));
                const registro = data.persona;
                if (!registro) {
                    return;
                }

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
            } catch (err) {
                avisar(err);
            }
        });
    }

    const saveHealthCardBtn = document.getElementById('btn-save-health-card');
    const healthCardList = document.getElementById('health-card-list');

    function filaCarnet(carnet) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><strong>${esc(carnet.cedula)}</strong></td>
            <td>${esc(carnet.nombre)}</td>
            <td><span class="badge-role">${esc(carnet.bloodType)}</span></td>
            <td>${esc(carnet.condition)}</td>
            <td>${esc(carnet.expiry)}</td>
            <td><button type="button" class="btn-delete">Eliminar</button></td>
        `;

        newRow.querySelector('.btn-delete').addEventListener('click', async () => {
            try {
                await api('api/carnet.php', { accion: 'eliminar', id: carnet.id });
                newRow.remove();
            } catch (err) {
                alert(err.message);
            }
        });

        return newRow;
    }

    if (saveHealthCardBtn && healthCardList) {
        api('api/carnet.php')
            .then((data) => {
                data.carnets.forEach((carnet) => healthCardList.appendChild(filaCarnet(carnet)));
            })
            .catch(avisar);

        saveHealthCardBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const cedula = document.getElementById('citizen-cedula')?.value.trim();
            const f1 = document.getElementById('citizen-first-name')?.value.trim();
            const l1 = document.getElementById('citizen-first-lastname')?.value.trim();
            const bloodType = document.getElementById('health-blood-type')?.value;
            const condition = document.getElementById('health-condition')?.value;
            const expiry = document.getElementById('health-expiry')?.value;

            if (!cedula || !f1 || !l1 || !bloodType || !condition || !expiry) {
                alert('Por favor complete los campos obligatorios del ciudadano y del carnet.');
                return;
            }

            try {
                const data = await api('api/carnet.php', {
                    cedula,
                    firstname1: f1,
                    firstname2: document.getElementById('citizen-second-name')?.value.trim() || '',
                    lastname1: l1,
                    lastname2: document.getElementById('citizen-second-lastname')?.value.trim() || '',
                    municipality: document.getElementById('citizen-municipality')?.value || '',
                    bloodType,
                    condition,
                    expiry
                });
                healthCardList.appendChild(filaCarnet(data.carnet));
                document.getElementById('subregion-form')?.reset();
            } catch (err) {
                alert(err.message);
            }
        });
    }

    // ==========================================
    // 5. MÓDULO CONSULTA PÚBLICA (CONSULTA.HTML)
    // ==========================================
    const searchPublicBtn = document.getElementById('btn-search-public');
    if (searchPublicBtn) {
        searchPublicBtn.addEventListener('click', async () => {
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

            let registro = null;
            try {
                const data = await api('api/consulta.php?cedula=' + encodeURIComponent(docInput));
                registro = data.registro;
            } catch (err) {
                alert(err.message);
                return;
            }

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
                            <td><strong>${esc(item.nombre)}</strong></td>
                            <td>${esc(item.dosis)}</td>
                            <td><span class="badge-success">${esc(item.estado)}</span></td>
                        </tr>
                    `).join('');
                }
            }
        });
    }

    // ==========================================
    // 6. EXPEDIENTE DEL VACUNADOR (INDEX.HTML)
    // ==========================================
    const addDoseBtn = document.getElementById('btn-add-dose');
    const doseList = document.getElementById('dynamic-vaccine-list');
    const expedienteForm = document.getElementById('sivan-form');

    function filaDosis(item) {
        const tr = document.createElement('tr');
        if (item.id) {
            tr.dataset.id = String(item.id);
        }
        tr.dataset.nombre = item.nombre || '';
        tr.dataset.numero = item.numero || '';
        tr.dataset.fecha = item.fecha || '';
        tr.dataset.lote = item.lote || '';
        tr.dataset.estado = item.estado || 'Aplicado';
        tr.dataset.observacion = item.observacion || '';

        const detalle = tr.dataset.estado === 'Pendiente'
            ? (tr.dataset.observacion || '—')
            : (tr.dataset.lote || '—');
        const vacuna = tr.dataset.numero
            ? `${tr.dataset.nombre} — ${tr.dataset.numero}`
            : tr.dataset.nombre;

        tr.innerHTML = `
            <td><strong>${esc(vacuna)}</strong></td>
            <td>${esc(tr.dataset.estado)}</td>
            <td>${esc(tr.dataset.fecha || '—')}</td>
            <td>${esc(detalle)}</td>
            <td><button type="button" class="btn-delete">Eliminar</button></td>
        `;

        tr.querySelector('.btn-delete').addEventListener('click', async () => {
            if (tr.dataset.id) {
                try {
                    await api('api/expediente.php', { accion: 'eliminar_dosis', id: Number(tr.dataset.id) });
                } catch (err) {
                    alert(err.message);
                    return;
                }
            }
            tr.remove();
        });

        return tr;
    }

    function leerBloqueDosis(pendiente) {
        const nombre = document.getElementById(pendiente ? 'select-vaccine-pending' : 'select-vaccine').value;
        if (!nombre) {
            alert('Seleccione la vacuna.');
            return null;
        }

        return {
            nombre,
            numero: document.getElementById(pendiente ? 'select-dose-num-pending' : 'select-dose-num').value,
            fecha: document.getElementById(pendiente ? 'input-date-pending' : 'input-date').value,
            lote: pendiente ? '' : document.getElementById('input-lot').value.trim(),
            observacion: pendiente ? document.getElementById('input-lot-pending').value.trim() : '',
            estado: pendiente ? 'Pendiente' : 'Aplicado'
        };
    }

    if (addDoseBtn && doseList && expedienteForm) {
        api('api/vacunas.php')
            .then((data) => {
                data.vacunas.forEach((vacuna) => {
                    agregarOpcionVacuna('select-vaccine', vacuna.nombre);
                    agregarOpcionVacuna('select-vaccine-pending', vacuna.nombre);
                });
            })
            .catch(avisar);

        const documentInput = document.getElementById('document');
        if (documentInput) {
            documentInput.addEventListener('blur', async () => {
                const cedula = documentInput.value.trim().replace(/\D/g, '');
                if (!cedula) {
                    return;
                }

                try {
                    const data = await api('api/personas.php?cedula=' + encodeURIComponent(cedula));
                    const persona = data.persona;
                    if (!persona) {
                        return;
                    }

                    const asignar = (id, valor) => {
                        const campo = document.getElementById(id);
                        if (campo) campo.value = valor || '';
                    };
                    asignar('firstname1', persona.firstname1);
                    asignar('firstname2', persona.firstname2);
                    asignar('lastname1', persona.lastname1);
                    asignar('lastname2', persona.lastname2);
                    asignar('blood-type', persona.bloodType);
                    asignar('email', persona.email);
                    asignar('age', persona.age);
                    asignar('state', persona.state);
                    asignar('municipality', persona.municipality);
                    asignar('parish', persona.parish);
                    asignar('subregion', persona.subregion);

                    doseList.innerHTML = '';
                    (persona.dosis || []).forEach((dosis) => doseList.appendChild(filaDosis(dosis)));
                } catch (err) {
                    avisar(err);
                }
            });
        }

        addDoseBtn.addEventListener('click', () => {
            const dosis = leerBloqueDosis(false);
            if (!dosis) {
                return;
            }
            doseList.appendChild(filaDosis(dosis));
            document.getElementById('input-date').value = '';
            document.getElementById('input-lot').value = '';
        });

        const addPendingBtn = document.getElementById('btn-add-pending');
        if (addPendingBtn) {
            addPendingBtn.addEventListener('click', () => {
                const dosis = leerBloqueDosis(true);
                if (!dosis) {
                    return;
                }
                doseList.appendChild(filaDosis(dosis));
                document.getElementById('input-date-pending').value = '';
                document.getElementById('input-lot-pending').value = '';
            });
        }

        expedienteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cedula = document.getElementById('document').value.trim();
            const firstname1 = document.getElementById('firstname1').value.trim();
            const lastname1 = document.getElementById('lastname1').value.trim();

            if (!cedula || !firstname1 || !lastname1) {
                alert('Complete cédula, primer nombre y primer apellido.');
                return;
            }

            const filasNuevas = [...doseList.querySelectorAll('tr')].filter((tr) => !tr.dataset.id);
            const dosis = filasNuevas.map((tr) => ({
                nombre: tr.dataset.nombre,
                numero: tr.dataset.numero,
                fecha: tr.dataset.fecha,
                lote: tr.dataset.lote,
                estado: tr.dataset.estado,
                observacion: tr.dataset.observacion
            }));

            try {
                const data = await api('api/expediente.php', {
                    cedula,
                    firstname1,
                    firstname2: document.getElementById('firstname2').value.trim(),
                    lastname1,
                    lastname2: document.getElementById('lastname2').value.trim(),
                    bloodType: document.getElementById('blood-type').value,
                    email: document.getElementById('email').value.trim(),
                    age: document.getElementById('age').value,
                    state: document.getElementById('state').value,
                    municipality: document.getElementById('municipality').value,
                    parish: document.getElementById('parish').value,
                    subregion: document.getElementById('subregion').value,
                    dosis
                });
                data.ids.forEach((id, index) => {
                    if (filasNuevas[index]) {
                        filasNuevas[index].dataset.id = String(id);
                    }
                });
                alert('Expediente guardado.');
            } catch (err) {
                alert(err.message);
            }
        });
    }

});
