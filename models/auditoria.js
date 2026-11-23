const consultar = require("./consultar");

module.exports = {
    registrar(usuarioId, accion, tabla, registroAfectado, detalle) {
        const partes = [];
        if (detalle) {
            partes.push(detalle);
        }
        if (registroAfectado) {
            partes.push("id " + registroAfectado);
        }

        return consultar("INSERT INTO Registro (Usuarios_id) VALUES (?)", [usuarioId || null])
            .then((resultado) => {
                return consultar(
                    `INSERT INTO Auditoria (Accion, Tabla_afectada, Registro_id, Detalle, Fecha, Hora)
                     VALUES (?, ?, ?, ?, CURDATE(), NOW())`,
                    [accion, tabla, resultado.insertId, partes.join(" | ") || null]
                );
            });
    },

    resumen() {
        return consultar(
            `SELECT COALESCE(e.estado, 'Sin jurisdicción') AS estado,
                    COALESCE(m.municipio, '—') AS municipio,
                    COUNT(d.id) AS total
             FROM Dosis d
             JOIN Personas p ON p.id = d.Personas_id
             LEFT JOIN Parroquias pa ON pa.id = p.Parroquias_id
             LEFT JOIN Municipios m ON m.id = pa.id_Municipios
             LEFT JOIN Estados e ON e.id = m.Estados_id
             GROUP BY COALESCE(e.estado, 'Sin jurisdicción'), COALESCE(m.municipio, '—')
             ORDER BY total DESC`
        );
    }
};
