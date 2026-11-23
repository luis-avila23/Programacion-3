const consultar = require("./consultar");

module.exports = {
    obtener() {
        return consultar(
            "SELECT id, Nombre, Apellido, Correo, Rol, Cargo FROM Usuarios ORDER BY id"
        ).then((filas) => filas.map((fila) => ({
            id: fila.id,
            nombre: (fila.Nombre + " " + (fila.Apellido || "")).trim(),
            correo: fila.Correo || "",
            rol: fila.Rol || fila.Cargo || ""
        })));
    },

    insertar(nombre, correo, rol) {
        return consultar("SELECT id FROM Usuarios WHERE LOWER(Correo) = ? LIMIT 1", [correo])
            .then((filas) => {
                if (filas.length) {
                    return Promise.reject(new Error("Ese correo ya está registrado."));
                }
                return consultar(
                    `INSERT INTO Usuarios (Nombre, Apellido, Centros_id, Cargo, Correo, Password, Rol)
                     VALUES (?, '', 1, ?, ?, ?, ?)`,
                    [nombre, rol, correo, "sivan123", rol]
                ).then((resultado) => resultado.insertId);
            });
    },

    eliminar(id) {
        return consultar("DELETE FROM Usuarios WHERE id = ?", [id]);
    }
};
