/**
 * Notifications.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var moment = require("moment");

module.exports = {
  	schema: true,
	attributes: {
		type: {
			type: "string"
		},
		message: {
			type: "string"
		},
		created: {
			type: "integer"
		},
		user: {
			type: "string"
		},
		global: {
			type: "boolean",
			defaultsTo: "false"
		}
	},

	beforeCreate: (values, next) => {
		values.created = Date.now();
		next();
	},

	afterCreate: (notif, next) => {
		sails.sockets.broadcast("user_notifications_" + notif.user, "nNotification", {
			type: notif.type,
			message: notif.message,
			created: moment(notif.created).fromNow(),
			id: notif.id
		});
		next();
	}
};

