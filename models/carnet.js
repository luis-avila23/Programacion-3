const consultar = require("./consultar");

module.exports = {
    obtener() {
        return consultar(
            `SELECT c.id, p.Cedula AS cedula,
                    TRIM(CONCAT(IFNULL(p.Primer_nombre, ''), ' ', IFNULL(p.Primer_apellido, ''))) AS nombre,
                    p.Tipo_sangre AS bloodType, c.Condicion_sanitaria AS condicion, c.Fecha_vencimiento AS expiry
             FROM Carnet c
             LEFT JOIN Personas p ON p.id = c.Personas_id
             ORDER BY c.id DESC`
        );
    },

    insertar(personaId, condicion, vencimiento) {
        return consultar(
            `INSERT INTO Carnet (Personas_id, Condicion_sanitaria, Fecha_emision, Fecha_vencimiento, Estatus)
             VALUES (?, ?, CURDATE(), ?, 'Emitido')`,
            [personaId, condicion, vencimiento]
        ).then((resultado) => {
            return consultar("UPDATE Carnet SET Codigo = ? WHERE id = ?", [resultado.insertId, resultado.insertId])
                .then(() => resultado.insertId);
        });
    },

    eliminar(id) {
        return consultar("DELETE FROM Carnet WHERE id = ?", [id]);
    }
};
