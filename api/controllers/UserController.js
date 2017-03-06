/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    auth: (req, res) => {
        if(req.session.authenticated) return res.ok();

        User.findOne({username: req.param("username")}).exec((err, user) => {
            if(err) return res.redirect("/"); // TODO: better error to users
            if(user) {

                // returning user
                req.session.authenticated = true;
                req.session.user = user;
                roblox.headshot(user.username, (url) => {
                    req.session.image = url;
                    res.redirect("/offers");
                });

            } else {

                // new user
                 console.log("New User");
                 var params = {
                     username: req.param("username"),
                     balance: 0,
                     tracker: require("crypto").createHash("md5").update(req.param("username") + Math.random()).digest("hex")
                 };
                User.create(params, (err, new_user) => {
                    if(err) return res.redirect("/");
                    req.session.authenticated = true;
                    req.session.user = new_user;
                    roblox.headshot(new_user.username, (url) => {
                        req.session.image = url;
                        res.redirect("/offers");
                    });
                });
            }
        });
    },

    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect("/");
        })
    },

    balance: (req, res) => {
        sails.sockets.join(req, "user_balance_" + req.session.user.id);
        res.ok();
    }
};

