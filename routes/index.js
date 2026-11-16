const express = require("express");
const router = express.Router();
const sesion = require("./sesion");

router.get("/", function (req, res) {
    if (req.session.loggedin) {
        return res.redirect(sesion.casa(req.session.rol));
    }
    res.redirect("/login");
});

module.exports = router;
