const express = require("express");
const router = express.Router();
const personasModel = require("../models/personas");
const dosisModel = require("../models/dosis");
const vacunasModel = require("../models/vacunas");
const auditoriaModel = require("../models/auditoria");
const sesion = require("./sesion");

router.use(sesion.exigir("Vacunador"));

function redirigir(res, cedula, mensaje) {
    let url = "/expediente?cedula=" + encodeURIComponent(cedula || "");
    if (mensaje) {
        url += "&mensaje=" + encodeURIComponent(mensaje);
    }
    res.redirect(url);
}

router.get("/", function (req, res, next) {
    const cedula = personasModel.limpiarCedula(req.query.cedula);
    const mensaje = req.query.mensaje || null;

    vacunasModel.obtener()
        .then((vacunas) => {
            if (!cedula) {
                return res.render("expediente", {
                    tituloPagina: "SIVAN - Expediente de Vacunación",
                    titulo: "Sistema de Información Nacional de Vacunación",
                    persona: personasModel.fichaVacia(""),
                    vacunas: vacunas,
                    mensaje: mensaje,
                    usuario: req.session.login
                });
            }

            return personasModel.obtenerPorCedula(cedula).then((persona) => {
                res.render("expediente", {
                    tituloPagina: "SIVAN - Expediente de Vacunación",
                    titulo: "Sistema de Información Nacional de Vacunación",
                    persona: persona || personasModel.fichaVacia(cedula),
                    vacunas: vacunas,
                    mensaje: mensaje || (persona ? null : "No hay una persona con esa cédula. Complete la ficha y guarde."),
                    usuario: req.session.login
                });
            });
        })
        .catch(next);
});

router.post("/guardar", function (req, res, next) {
    const cedula = personasModel.limpiarCedula(req.body.cedula);
    if (!cedula || !req.body.firstname1 || !req.body.lastname1) {
        return redirigir(res, cedula, "Complete cédula, primer nombre y primer apellido.");
    }

    personasModel.guardar(req.body)
        .then((id) => auditoriaModel.registrar(req.session.usuarioId, "guardar", "personas", id, "Cédula " + cedula))
        .then(() => redirigir(res, cedula, "Expediente guardado."))
        .catch(next);
});

router.post("/dosis", function (req, res, next) {
    const cedula = personasModel.limpiarCedula(req.body.cedula);
    const pendiente = req.body.estado === "Pendiente";
    const item = {
        nombre: pendiente ? req.body.nombrePendiente : req.body.nombre,
        numero: pendiente ? req.body.numeroPendiente : req.body.numero,
        fecha: pendiente ? req.body.fechaPendiente : req.body.fecha,
        lote: pendiente ? "" : req.body.lote,
        observacion: pendiente ? req.body.observacion : "",
        estado: pendiente ? "Pendiente" : "Aplicado"
    };

    if (!cedula || !req.body.firstname1 || !req.body.lastname1) {
        return redirigir(res, cedula, "Complete cédula, primer nombre y primer apellido.");
    }
    if (!item.nombre) {
        return redirigir(res, cedula, "Seleccione la vacuna.");
    }

    personasModel.guardar(req.body)
        .then((personaId) => dosisModel.insertar(personaId, item))
        .then((dosisId) => auditoriaModel.registrar(req.session.usuarioId, "insertar", "dosis", dosisId, item.nombre))
        .then(() => redirigir(res, cedula, "Dosis registrada."))
        .catch(next);
});

router.get("/dosis/eliminar/:id", function (req, res, next) {
    const cedula = personasModel.limpiarCedula(req.query.cedula);
    dosisModel.eliminar(req.params.id)
        .then(() => auditoriaModel.registrar(req.session.usuarioId, "eliminar", "dosis", req.params.id, "Baja de dosis"))
        .then(() => redirigir(res, cedula, "Dosis eliminada."))
        .catch(next);
});

module.exports = router;
