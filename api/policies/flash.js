
module.exports = function(req, res, next) {
    if(typeof req.session.authenticated == "undefined" || req.session.authenticated == false) {
        req.session.authenticated = false;
        res.locals.authenticated = false;
    } else {
        res.locals.authenticated = _.clone(req.session.authenticated);
        res.locals.image = _.clone(req.session.image);
        res.locals.user = _.clone(req.session.user);

        if(req.session.error) res.locals.error = _.clone(req.session.error);
        delete req.session.error;            

        User.findOne({id: req.session.user.id}, (err, user) => {
            if(err || !user) return res.serverError("Can't find user");
            req.session.user = _.clone(user);
            res.locals.user = _.clone(user);
        });           
    }

    next();
}
    