const conexion = require("../conexion");

function consultar(sql, params) {
    return new Promise((resolve, reject) => {
        conexion.query(sql, params || [], (err, resultados) => {
            if (err) reject(err);
            else resolve(resultados);
        });
    });
}

module.exports = consultar;
