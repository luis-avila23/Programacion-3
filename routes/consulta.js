const express = require("express");
const router = express.Router();
const personasModel = require("../models/personas");

router.get("/", function (req, res, next) {
    const cedula = personasModel.limpiarCedula(req.query.cedula);
    if (!cedula) {
        return res.render("consulta", {
            tituloPagina: "SIVAN - Consulta Ciudadana",
            titulo: "Portal de Consulta Pública del Ciudadano",
            publico: true,
            cedula: req.query.cedula || "",
            registro: null,
            buscado: false,
            mensaje: req.query.cedula ? "Ingrese un número de cédula." : null
        });
    }

    personasModel.obtenerPorCedula(cedula)
        .then((registro) => {
            res.render("consulta", {
                tituloPagina: "SIVAN - Consulta Ciudadana",
                titulo: "Portal de Consulta Pública del Ciudadano",
                publico: true,
                cedula: cedula,
                registro: registro,
                buscado: true,
                mensaje: null
            });
        })
        .catch(next);
});

module.exports = router;
