/**
 * PayoutsController
 *
 * @description :: Server-side logic for managing payouts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var moment = require("moment");

module.exports = {
    new: (req, res) => {
        console.log("Params:", req.params.all());
        User.findOne({tracker: req.param("track")}).exec((err, user) => {
            if(!user || err) return res.json({err});
            Payouts.create({recipent: user, amount: req.param("payout") * 1000, offer: req.param("offer")}, (err, payout) => {
                if(!payout || err) return res.json({err});
                User.update({id: user.id}, {balance: payout.recipent.balance + payout.amount}).exec((err, user) => {
                    Notifications.create({
                        type: "reward",
                        message: `You received ${payout.amount} gems.`,
                        user: user[0].id
                    }, () => {
                        res.ok("cool");
                    });
                });
            });
        });
    }   
};

