var request = require("request");
var MobileDetect = require('mobile-detect');

module.exports = {
    affiliateid: 71958,
    grip_affiliateid: 98178,
    offset: 250,

    get: (options, done) => {
        var md = new MobileDetect(options.ua);
        options.device = "desktop";
        if(md.is("iPhone")) options.device = "iphone";
        if(md.is("iPad")) options.device = "ipad";
        if(md.is("Android")) options.device = "android";


        const qs = {
            affiliateid: offers.affiliateid,
            aff_sub4: options.tracker,
            device: options.device
        }

        if(options.ip) qs.ip = options.ip

        request({
            url: "http://mobverify.com/api/v1",
            qs: qs
        }, (err, res, body) => {
            if(err || res.statusCode != 200) return sails.log(err, res.statusCode);
            var parse = JSON.parse(body);
            if(parse.success) {
                done(_.map(parse.offers, (offer) => {
                    var omit = _.omit(offer, ["device", "link", "epc", "country"]);
                    if(!omit.description) omit.description = "Awarded upon completion";
                    omit.offerid += offers.offset;
                    omit.payout *= 1000;
                    return omit;
                }));
            } else {
                done();
            }
        });
    }
}

        /*

        var async = require("async");

function httpGet(url, callback) {
  const options = {
    url :  url,
    json : true
  };
  request(options,
    function(err, res, body) {
      callback(err, body);
    }
  );
}




        var final = [];
        async.map([
            `http://mobverify.com/api/v1?affiliateid=${offers.affiliateid}&aff_sub3=${options.tracker}&ip=${options.ip}&device=desktop`,
            `https://www.cpagrip.com/common/offer_feed_json.php?user_id=${offers.grip_affiliateid}&pubkey=dd7babf5451598d1119d90d1d9c2808a&tracking_id=${options.tracker}&ua=${options.ua}`
        ], (url, callback) => {
                const options = {
                    url :  url,
                    json : true
                };
                request(options,
                    function(err, res, body) {
                    callback(err, body);
                    }
                );
            }, (err, res) => {
                console.log(res);
            })
            done();
            */
