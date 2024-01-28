const forbidden = ((res) => {
    return res.status(403).send({
        status: 403,
        success: false,
        error: "Acceso denegado.",
    });
})

function admin(req, res, next) {
    if (req.user.rol < 20) return forbidden(res);
    next();
}

function viewer(req, res, next) {
    if (!req.user.rol && req.user.rol != 0) return forbidden(res);
    next();
}

function self(req, res, next) {
    if (req.body.id_usuario != req.user.id && req.user.rol < 20) return forbidden(res);
    next();
}

module.exports = { admin, viewer, self };
