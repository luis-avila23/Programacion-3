const consultar = require("./consultar");

module.exports = {
    validar(login, password) {
        return new Promise((resolve, reject) => {
            consultar(
                "SELECT id, Correo, Rol FROM usuarios WHERE LOWER(Correo) = ? AND Password = ?",
                [String(login || "").toLowerCase(), password]
            ).then((resultados) => resolve(resultados[0]))
                .catch(reject);
        });
    }
};
