const consultar = require("./consultar");

function idVacuna(nombre) {
    const limpio = String(nombre || "").trim();
    if (!limpio) {
        return Promise.reject(new Error("Seleccione la vacuna."));
    }

    return consultar("SELECT id FROM vacunas WHERE Nombre = ? LIMIT 1", [limpio])
        .then((filas) => {
            if (filas.length) {
                return filas[0].id;
            }
            return consultar("INSERT INTO vacunas (Nombre, Esquema) VALUES (?, ?)", [limpio, "Dosis Única"])
                .then((resultado) => resultado.insertId);
        });
}

module.exports = {
    insertar(personaId, item) {
        const estado = item.estado === "Pendiente" ? "Pendiente" : "Aplicado";
        const fecha = item.fecha ? item.fecha : null;
        const lote = item.lote ? item.lote : null;
        const observacion = item.observacion ? item.observacion : null;
        const numero = item.numero || "1ra Dosis";

        return idVacuna(item.nombre).then((vacunaId) => {
            return consultar(
                `INSERT INTO dosis (Numero, Vacunas_id, Personas_id, Fecha_aplicacion, Lote, Estado, Observacion)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [numero, vacunaId, personaId, fecha, lote, estado, observacion]
            ).then((resultado) => resultado.insertId);
        });
    },

    eliminar(id) {
        return consultar("DELETE FROM dosis WHERE id = ?", [id]);
    }
};
