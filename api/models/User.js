/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	schema: true,
	attributes: {
		username: {
			type: "string",
			unique: true,
			required: true
		},
		balance: {
			type: "integer",
			defaultsTo: 0,
			required: true
		},
		tracker: {
			type: "string",
			required: true,
			unique: true
		},
		affiliate: {
			type: "string",
			defaultsTo: null
		},
		locked: {
			type: "boolean",
			defaultsTo: false
		}
	},

	beforeCreate: function(values, next) {
		if(!values.username)
			return next({err: ["Please complete the form."]});
		roblox.usernameExists(values.username, (exists) => {
			console.log(exists);
			if(!exists) {
				next({err: ["Username does not exist."]}); 
			} else {
				next();
			}
		});
	},

	afterUpdate: function(values, next) {
		sails.sockets.broadcast("user_balance_" + values.id, "balance", {
			balance: values.balance
		});
		next();
	}
};

