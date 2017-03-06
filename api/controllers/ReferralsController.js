/**
 * ReferralsController
 *
 * @description :: Server-side logic for managing referrals
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: (req, res) => {
		res.view("referrals");
  	},

	new: (req, res) => {
		res.view('create_referral');
	}
};

