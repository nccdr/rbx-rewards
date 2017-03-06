/**
 * OffersController
 *
 * @description :: Server-side logic for managing offers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: (req, res) => {
        roblox.userInGroup(req.session.user.username, (inGroup) => {
            if(inGroup) {
                offers.get({ip: (req.ip ? req.param : null), tracker: req.session.user.tracker, ua: req.headers["user-agent"]}, (offers) => {
                    /* render _with_ offers */
                    res.view("offers", {
                        in_group: inGroup,
                        groupUrl: roblox.groupUrl,
                        offers: offers,
                        authenticated: true
                    });                   
                });
            } else {          
                /* render without offers */
                res.view("offers", {
                    in_group: inGroup,
                    groupUrl: roblox.groupUrl,
                    authenticated: true
                });
            }
        });
    },

    redirect: (req, res) => {
        res.redirect(`http://jump.ogtrk.net/aff_c?aff_id=${ offers.affiliateid }&offer_id=${ req.param('id') - offers.offset }&aff_sub4=${ req.session.user.tracker }`);
    }
};

