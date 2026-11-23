const consultar = require("./consultar");
const territorio = require("./territorio");

function limpiarCedula(cedula) {
    return String(cedula || "").replace(/\D/g, "");
}

function fichaVacia(cedula) {
    return {
        cedula: cedula || "",
        firstname1: "",
        firstname2: "",
        lastname1: "",
        lastname2: "",
        municipality: "",
        state: "",
        parish: "",
        subregion: "",
        bloodType: "",
        email: "",
        age: "",
        condition: "",
        expiry: "",
        dosis: []
    };
}

function armarFicha(fila, dosis, carnet) {
    return {
        cedula: fila.Cedula || "",
        firstname1: fila.Primer_nombre || "",
        firstname2: fila.Segundo_nombre || "",
        lastname1: fila.Primer_apellido || "",
        lastname2: fila.Segundo_apellido || "",
        municipality: territorio.valorPorId(territorio.municipios, fila.id_municipio) || fila.municipio_nombre || "",
        state: fila.estado_nombre || "",
        parish: territorio.valorPorId(territorio.parroquias, fila.Parroquias_id),
        subregion: territorio.valorPorId(territorio.subregiones, fila.Subregiones_id),
        bloodType: fila.Tipo_sangre || "",
        email: fila.Correo || "",
        age: fila.Edad || "",
        condition: carnet ? (carnet.Condicion_sanitaria || "") : "",
        expiry: carnet && carnet.Fecha_vencimiento ? String(carnet.Fecha_vencimiento).slice(0, 10) : "",
        dosis: dosis
    };
}

module.exports = {
    limpiarCedula,
    fichaVacia,

    obtenerPorCedula(cedula) {
        const limpia = limpiarCedula(cedula);
        if (!limpia) {
            return Promise.resolve(null);
        }

        return consultar(
            `SELECT p.id, p.Primer_nombre, p.Segundo_nombre, p.Primer_apellido, p.Segundo_apellido,
                    p.Cedula, p.Edad, p.Correo, p.Tipo_sangre, p.Parroquias_id, p.Subregiones_id,
                    m.id AS id_municipio, m.municipio AS municipio_nombre, e.estado AS estado_nombre
             FROM Personas p
             LEFT JOIN Parroquias pa ON pa.id = p.Parroquias_id
             LEFT JOIN Municipios m ON m.id = pa.id_Municipios
             LEFT JOIN Estados e ON e.id = m.Estados_id
             WHERE p.Cedula = ?
             LIMIT 1`,
            [limpia]
        ).then((filas) => {
            if (!filas.length) {
                return null;
            }

            const fila = filas[0];
            return consultar(
                `SELECT d.id, d.Numero AS numero, d.Fecha_aplicacion AS fecha, d.Lote AS lote,
                        d.Estado AS estado, d.Observacion AS observacion, v.Nombre AS nombre
                 FROM Dosis d
                 LEFT JOIN Vacunas v ON v.id = d.Vacunas_id
                 WHERE d.Personas_id = ?
                 ORDER BY d.id`,
                [fila.id]
            ).then((dosis) => {
                return consultar(
                    `SELECT Condicion_sanitaria, Fecha_vencimiento
                     FROM Carnet
                     WHERE Personas_id = ?
                     ORDER BY id DESC
                     LIMIT 1`,
                    [fila.id]
                ).then((carnets) => armarFicha(fila, dosis, carnets[0]));
            });
        });
    },

    guardar(datos) {
        const cedula = limpiarCedula(datos.cedula);
        if (!cedula) {
            return Promise.reject(new Error("La cédula es obligatoria."));
        }

        const lugar = territorio.resolver(datos.municipality || "", datos.parish || "", datos.subregion || "");
        const valores = [
            datos.firstname1 || null,
            datos.firstname2 || null,
            datos.lastname1 || null,
            datos.lastname2 || null,
            datos.age || null,
            datos.email || null,
            datos.bloodType || null,
            lugar.parroquiaId,
            lugar.subregionId,
            1
        ];

        return consultar("SELECT id FROM Personas WHERE Cedula = ? LIMIT 1", [cedula])
            .then((filas) => {
                if (filas.length) {
                    return consultar(
                        `UPDATE Personas
                         SET Primer_nombre = ?, Segundo_nombre = ?, Primer_apellido = ?, Segundo_apellido = ?,
                             Edad = ?, Correo = ?, Tipo_sangre = ?, Parroquias_id = ?, Subregiones_id = ?, Centros_id = ?
                         WHERE id = ?`,
                        valores.concat(filas[0].id)
                    ).then(() => filas[0].id);
                }

                return consultar(
                    `INSERT INTO Personas
                     (Primer_nombre, Segundo_nombre, Primer_apellido, Segundo_apellido, Edad, Correo, Tipo_sangre, Parroquias_id, Subregiones_id, Centros_id, Cedula)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    valores.concat(cedula)
                ).then((resultado) => resultado.insertId);
            });
    },

    idPorCedula(cedula) {
        return consultar("SELECT id FROM Personas WHERE Cedula = ? LIMIT 1", [limpiarCedula(cedula)])
            .then((filas) => (filas.length ? filas[0].id : null));
    }
};
