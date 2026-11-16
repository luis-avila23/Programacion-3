const consultar = require("./consultar");

module.exports = {
    registrar(usuarioId, accion, tabla, registroId, detalle) {
        return consultar(
            `INSERT INTO auditoria_logs (Usuarios_id, Accion, Tabla_afectada, Registro_id, Detalle)
             VALUES (?, ?, ?, ?, ?)`,
            [usuarioId || null, accion, tabla, registroId || null, detalle || null]
        );
    },

    resumen() {
        return consultar(
            `SELECT COALESCE(e.estado, 'Sin jurisdicción') AS estado,
                    COALESCE(m.municipio, '—') AS municipio,
                    COUNT(d.id) AS total
             FROM dosis d
             JOIN personas p ON p.id = d.Personas_id
             LEFT JOIN parroquias pa ON pa.id_parroquia = p.id_parroquia
             LEFT JOIN municipios m ON m.id_municipio = pa.id_municipio
             LEFT JOIN estados e ON e.id_estado = m.id_estado
             GROUP BY COALESCE(e.estado, 'Sin jurisdicción'), COALESCE(m.municipio, '—')
             ORDER BY total DESC`
        );
    }
};
