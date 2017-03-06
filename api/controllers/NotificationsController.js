/**
 * NotificationsController
 *
 * @description :: Server-side logic for managing notifications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var moment = require("moment");

module.exports = {
    //TODO: LOCK THIS CONTROLLER DOWN WITH POLICIES!!!!!!!!
	subscribe: (req, res) => {  
        Notifications.find({or: [{user: req.session.user.id}, {global: true}]}).exec((err, notifs) => {
            if(!notifs) return res.json({});
            sails.sockets.join(req, "user_notifications_null");
            sails.sockets.join(req, "user_notifications_" + req.session.user.id, () => {
                return res.json(_.map(notifs, (notif) => {
                    var obj = _.omit(notif, ["user", "createdAt", "updatedAt", "global"]);
                    obj.created = moment(obj.created).fromNow();
                    return obj;
                }));
            });
        });
    },

    remove: (req, res) => {
        Notifications.findOne({id: req.param("id"), user: req.session.user.id}, (err, notif) => {
            if(err) return res.serverError();
            if(!notif) return res.ok();
            if(notif.global) return res.forbidden();
            Notifications.destroy({id: notif.id}, () => {
                res.ok();
            });
        });
}/*,
    
     //dont uncomment without adding a policy !!

    new: (req, res) => {
        Notifications.create({
            type: req.param("type"),
            message: req.param("message"),
            user: req.param("user"),
            global: (typeof req.param("global") == "undefined" ? false : true)
        }, (err) => {
            res.ok();
        });
    }*/
};

