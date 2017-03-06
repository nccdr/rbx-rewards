/**
 * RedeemController
 *
 * @description :: Server-side logic for managing redeems
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    index: (req, res) => {
        roblox.groupFunds()
		.then((funds) => {
            res.view("redeem", {
                funds: {
                    //"10000": (funds - 10000 < 0 ? false : true),
                    "5000": (funds - 5000 < 0 ? false : true),
                    "1000": (funds - 1000 < 0 ? false : true),
                    "500": (funds - 500 < 0 ? false : true),
                    "100": (funds - 100 < 0 ? false : true)
                }
            });
        })
		.catch(() => {
			return res.serverError();
		})
    },

    new: (req, res) => {
		if(!req.isSocket) return res.forbidden();

		User.findOne({id: req.session.user.id})
		.exec((err, user) => {
			if(err || !user) return res.json({error: "Server error."});
			if(_.isUndefined(req.param("amt"))) return res.json({error: "Malformed request."});
			
				user.locked = true;
				user.save(() => {
					var amt = {
						robux: req.param("amt"),
						balance: req.param("amt") * 10
					};
					
					if(amt.robux != 100 && amt.robux  != 500 && amt.robux  != 1000 && amt.robux  != 5000) return res.json({error: "Malformed request."});
					if(user.balance	- amt.balance < 0) return res.json({error: "Insufficient funds."});

					roblox.groupFunds()
					.then((funds) => {
						if(funds - amt.robux < 0) return res.json({error: "Insufficient site funds."});

						Redeem.create({recipent: user, amount: amt.robux})
						.exec((err, rdm) => {
							if(err || !rdm) return res.json({error: "Server error."});

							User.update({id: req.session.user.id}, {balance: user.balance - amt.balance, locked: false})
							.exec(() => {
								roblox.groupPayout({username: req.session.user.username, amount: amt.robux}, () => {
									Notifications.create({
										type: "withdraw",
										message: `You received ${amt.robux} Robux.`,
										user: req.session.user.id
									}, () => {
										return res.json({error: null});
									});							
								});
							})
						});
					})
					.catch((err) => {
						return res.json({error: err});
					});
				});
		});
	}
};
