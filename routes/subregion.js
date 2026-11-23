const express = require("express");
const router = express.Router();
const personasModel = require("../models/personas");
const carnetModel = require("../models/carnet");
const auditoriaModel = require("../models/auditoria");
const sesion = require("./sesion");

router.use(sesion.exigir("Subregion"));

function redirigir(res, cedula, mensaje) {
    let url = "/subregion?cedula=" + encodeURIComponent(cedula || "");
    if (mensaje) {
        url += "&mensaje=" + encodeURIComponent(mensaje);
    }
    res.redirect(url);
}

router.get("/", function (req, res, next) {
    const cedula = personasModel.limpiarCedula(req.query.cedula);
    const mensaje = req.query.mensaje || null;

    carnetModel.obtener()
        .then((carnets) => {
            if (!cedula) {
                return res.render("subregion", {
                    tituloPagina: "SIVAN - Subregión de Salud",
                    titulo: "Subregión",
                    persona: personasModel.fichaVacia(""),
                    carnets: carnets,
                    mensaje: mensaje,
                    usuario: req.session.login
                });
            }

            return personasModel.obtenerPorCedula(cedula).then((persona) => {
                res.render("subregion", {
                    tituloPagina: "SIVAN - Subregión de Salud",
                    titulo: "Subregión",
                    persona: persona || personasModel.fichaVacia(cedula),
                    carnets: carnets,
                    mensaje: mensaje || (persona ? null : "No hay una persona con esa cédula."),
                    usuario: req.session.login
                });
            });
        })
        .catch(next);
});

router.post("/guardar", function (req, res, next) {
    const cedula = personasModel.limpiarCedula(req.body.cedula);
    if (!cedula || !req.body.firstname1 || !req.body.lastname1 || !req.body.bloodType || !req.body.condition || !req.body.expiry) {
        return redirigir(res, cedula, "Por favor complete los campos obligatorios del ciudadano y del carnet.");
    }

    personasModel.guardar(req.body)
        .then((personaId) => carnetModel.insertar(personaId, req.body.condition, req.body.expiry))
        .then((carnetId) => auditoriaModel.registrar(req.session.usuarioId, "insertar", "Carnet", carnetId, "Cédula " + cedula))
        .then(() => redirigir(res, "", "Carnet registrado."))
        .catch(next);
});

router.get("/eliminar/:id", function (req, res, next) {
    carnetModel.eliminar(req.params.id)
        .then(() => auditoriaModel.registrar(req.session.usuarioId, "eliminar", "Carnet", req.params.id, "Baja de carnet"))
        .then(() => redirigir(res, "", "Carnet eliminado."))
        .catch(next);
});

module.exports = router;
