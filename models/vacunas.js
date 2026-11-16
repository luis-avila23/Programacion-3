const consultar = require("./consultar");

module.exports = {
    obtener() {
        return consultar("SELECT id, Nombre AS nombre, Esquema AS esquema FROM vacunas ORDER BY id");
    },

    insertar(nombre, esquema) {
        return consultar("INSERT INTO vacunas (Nombre, Esquema) VALUES (?, ?)", [nombre, esquema])
            .then((resultado) => resultado.insertId);
    },

    eliminar(id) {
        return consultar("DELETE FROM vacunas WHERE id = ?", [id]);
    }
};
