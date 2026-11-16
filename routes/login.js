const express = require("express");
const router = express.Router();
const loginModel = require("../models/login");
const sesion = require("./sesion");

router.get("/", function (req, res) {
    if (req.session.loggedin) {
        return res.redirect(sesion.casa(req.session.rol));
    }
    res.render("login", { mensaje: null });
});

router.post("/envio", function (req, res) {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.render("login", { mensaje: "Ingrese usuario y contraseña." });
    }

    loginModel
        .validar(login, password)
        .then((resultado) => {
            if (resultado) {
                req.session.loggedin = true;
                req.session.login = login;
                req.session.rol = resultado.Rol;
                req.session.usuarioId = resultado.id;
                return res.redirect(sesion.casa(resultado.Rol));
            }
            res.render("login", { mensaje: "Usuario o contraseña incorrectos." });
        })
        .catch(() => {
            return res.status(500).send("Error validando usuario");
        });
});

module.exports = router;
