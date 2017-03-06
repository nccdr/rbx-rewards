var request = require("request");

var groupID = "3065731";

var cookie = require("../secret/secret.js");

var roblox_endpoints = {
    USERNAME_EXISTS: "https://www.roblox.com/UserCheck/DoesUsernameExist",
	USER_IN_GROUP: `https://www.roblox.com/Game/LuaWebService/HandleSocialRequest.ashx?method=IsInGroup&groupid=${groupID}`,
	ID_FROM_USER: "https://api.roblox.com/users/get-by-username",
	GROUP_ADMIN: `https://www.roblox.com/my/groupadmin.aspx?gid=${groupID}`,
	ONETIME_PAYOUT: `https://www.roblox.com/groups/${groupID}/one-time-payout/1/false`,
	HEADSHOT: "https://www.roblox.com/headshot-thumbnail/json"
} 

var cookies = request.jar();
cookies.setCookie(`.ROBLOSECURITY=${cookie}`, roblox_endpoints.ONETIME_PAYOUT);
cookies.setCookie(`.ROBLOSECURITY=${cookie}`, roblox_endpoints.GROUP_ADMIN);

//var request = request.defaults({'proxy':'127.0.0.1:8888'});

module.exports = {
	groupID: groupID,
	groupUrl: `https://www.roblox.com/My/Groups.aspx?gid=${groupID}`,

    usernameExists: (options, done) => {
		request({
			url: roblox_endpoints.USERNAME_EXISTS,
			qs: {username: options}
		}, (err, res, body) => {
			if(err || res.statusCode != 200) { return done(false); } // TODO: something better?
			if(JSON.parse(body).success == false) { return done(false); }
			return done(true);
		});        
    },

	userID: (options, done) => {
		request({
			url: roblox_endpoints.ID_FROM_USER,
			qs: {username: options}
		}, (err, res, body) => {
			if(err || res.statusCode != 200) { return done(0); } // TODO: something better?
			var parse = JSON.parse(body);
			if(parse.Id) { return done(parse.Id); }
			done(0);
		});
	},

	userInGroup: (options, done) => {
		roblox.userID(options, (id) => {	
			request({
				url: roblox_endpoints.USER_IN_GROUP,
				qs: {playerid: id}
			}, (err, res, body) => {
				if(err || res.statusCode != 200) { return done(false); } // TODO: something better?
				if(body.indexOf("true") == -1) { return done(false); }
				return done(true);
			});
		});
	},

	groupPayout: (options, done) => {
		roblox.userID(options.username, (id) => {
			// get xcsrf
			request({
				url: roblox_endpoints.GROUP_ADMIN, 
				jar: cookies
			}, (err, res, body) => {
				if(err || res.statusCode != 200) { return done(""); } // TODO: something better?
				var csrf = /Token\('(\S+)'/g.exec(body)[1];

				// send payment
				request({
					url: roblox_endpoints.ONETIME_PAYOUT,
					method: "POST",
					jar: cookies,
					form: {
						percentages: `{"${id}":"${options.amount}"}`	
					},
					headers: {
						"X-CSRF-TOKEN": csrf,
					}
				}, (err, res, body) => {
					done(body);
				});
			});
		});
	},

	headshot: (options, done) => {
		roblox.userID(options, (id) => {
			request({
				url: roblox_endpoints.HEADSHOT,
				qs: {
					width: 180,
					height: 180,
					userId: id
				}
			}, (err, res, body) => {
				if(err || res.statusCode != 200) { return done(""); } // TODO: something better?
				done(JSON.parse(body).Url);
			});
		});
	},

	groupFunds: () => {
		return new Promise((resolve, reject) => {
			request({
				url: roblox_endpoints.GROUP_ADMIN,
				jar: cookies
			}, (err, res, body) => {
				var parts = /Group Funds:\s+<span class='robux'>(\d+)<\/span>/g.exec(body);
				(_.isUndefined(parts[1]) ? reject("Server error.") : resolve(parts[1]));
			});
		});

	}
}
