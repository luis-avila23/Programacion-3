const consultar = require("./consultar");

module.exports = {
    obtener() {
        return consultar("SELECT id, Nombre AS nombre, Esquema AS esquema FROM Vacunas ORDER BY id");
    },

    insertar(nombre, esquema) {
        return consultar("INSERT INTO Vacunas (Nombre, Esquema, Centros_id) VALUES (?, ?, ?)", [nombre, esquema, 1])
            .then((resultado) => resultado.insertId);
    },

    eliminar(id) {
        return consultar("DELETE FROM Vacunas WHERE id = ?", [id]);
    }
};
