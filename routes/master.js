const express = require("express");
const router = express.Router();
const usuariosModel = require("../models/usuarios");
const vacunasModel = require("../models/vacunas");
const auditoriaModel = require("../models/auditoria");
const sesion = require("./sesion");

router.use(sesion.exigir("Master"));

function pintar(req, res, next, mensaje) {
    Promise.all([usuariosModel.obtener(), vacunasModel.obtener(), auditoriaModel.resumen()])
        .then((resultado) => {
            res.render("master", {
                tituloPagina: "SIVAN - Panel Master",
                titulo: "Panel Master",
                usuarios: resultado[0],
                vacunas: resultado[1],
                filas: resultado[2],
                mensaje: mensaje || null,
                usuario: req.session.login
            });
        })
        .catch(next);
}

router.get("/", function (req, res, next) {
    pintar(req, res, next, req.query.mensaje || null);
});

router.post("/usuarios", function (req, res, next) {
    const nombre = (req.body.nombre || "").trim();
    const correo = (req.body.correo || "").trim().toLowerCase();
    const rol = req.body.rol;
    const roles = ["Master", "Subregion", "Vacunador"];

    if (!nombre || !correo || roles.indexOf(rol) === -1) {
        return res.redirect("/master?mensaje=" + encodeURIComponent("Complete todos los campos."));
    }

    usuariosModel.insertar(nombre, correo, rol)
        .then((id) => auditoriaModel.registrar(req.session.usuarioId, "insertar", "Usuarios", id, correo))
        .then(() => res.redirect("/master?mensaje=" + encodeURIComponent("Usuario registrado. Entra con la contraseña sivan123.")))
        .catch((err) => {
            if (err.message === "Ese correo ya está registrado.") {
                return res.redirect("/master?mensaje=" + encodeURIComponent(err.message));
            }
            next(err);
        });
});

router.get("/usuarios/eliminar/:id", function (req, res, next) {
    usuariosModel.eliminar(req.params.id)
        .then(() => auditoriaModel.registrar(req.session.usuarioId, "eliminar", "Usuarios", req.params.id, "Baja de usuario"))
        .then(() => res.redirect("/master?mensaje=" + encodeURIComponent("Usuario eliminado.")))
        .catch(next);
});

router.post("/vacunas", function (req, res, next) {
    const nombre = (req.body.nombre || "").trim();
    const esquema = (req.body.esquema || "").trim();
    if (!nombre || !esquema) {
        return res.redirect("/master?mensaje=" + encodeURIComponent("Complete los datos del biológico."));
    }

    vacunasModel.insertar(nombre, esquema)
        .then((id) => auditoriaModel.registrar(req.session.usuarioId, "insertar", "Vacunas", id, nombre))
        .then(() => res.redirect("/master?mensaje=" + encodeURIComponent("Biológico agregado.")))
        .catch(next);
});

router.get("/vacunas/eliminar/:id", function (req, res, next) {
    vacunasModel.eliminar(req.params.id)
        .then(() => auditoriaModel.registrar(req.session.usuarioId, "eliminar", "Vacunas", req.params.id, "Baja de biológico"))
        .then(() => res.redirect("/master"))
        .catch((err) => {
            if (err && err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.redirect("/master?mensaje=" + encodeURIComponent("No se puede eliminar: el biológico tiene dosis registradas."));
            }
            next(err);
        });
});

module.exports = router;
