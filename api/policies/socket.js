
module.exports = function(req, res, next) {
    if(!req.isSocket) return res.forbidden();
    next();
}