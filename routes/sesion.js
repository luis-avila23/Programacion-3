function casa(rol) {
    if (rol === "Master") return "/master";
    if (rol === "Subregion") return "/subregion";
    return "/expediente";
}

function exigir(rol) {
    return function (req, res, next) {
        if (req.session.loggedin && req.session.rol === rol) {
            return next();
        }
        if (req.session.loggedin) {
            return res.redirect(casa(req.session.rol));
        }
        return res.redirect("/login");
    };
}

module.exports = {
    casa: casa,
    exigir: exigir
};
