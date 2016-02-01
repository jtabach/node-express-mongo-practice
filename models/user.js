'use strict';

var mongoose = require('mongoose');
var Firesbase = require('firebase');
var jwt = require('jwt-simple');

var JWT_SECRET = process.env.JWT_SECRET;

var User;

var ref  = new Firebase('https://mongo-node-test.firebaseio.com/');

var userSchema = mongoose.Schema({
	firebaseId: {type: String, required: true },
	email: { type: String, requied: true }
});

userSchema.statics.register = function(userObj, cb) {
	if (!userObj.email) return cb('Missing email address');
	if (!userObj.password) return cb('Missing password');
	ref.createUser(userObj, function(err, firebaseObj) {
		if (err) return cb(err);

		var user = new User();
		user.firebaseId = firebaseObj.uid;
		user.email = userObj.email;
		user.save(cb)
	})
}

userSchema.statics.login = function(userObj, cb) {
	if (!userObj.email) return cb('Missing email address');
	if (!userObj.password) return cb('Missing password');
	ref.authWithPassword(userObj, function(err, firebaseObj) {
		if (err) return cb(err);

		User.findOne({firebaseId: firebaseObj.uid}, function(err, userObj) {
			if (err || !userObj) return cb(err || "user not found");
			var token = userObj.generateToken();
			cb(null, token);
		})		
	})
}

userSchema.statics.isLoggedIn = function(req, res, next) {
	console.log(req.cookies.userToken);
	var token = req.cookies.userToken;
	if (!token) return res.status(401).send('Authentication failed: No Token found');

	try {
		var payload = jwt.decode(token, JWT_SECRET);
	} catch (err) {
		return res.status(401).send('Authentication failed: Decode failed');
	}

	req.token = payload;
	next();
}

userSchema.methods.generateToken = function() {
	var payload = {
		firebaseId: this.firebaseId,
		_id: this._id
	};

	var token = jwt.encode(payload, JWT_SECRET);
	return token;
}


User = mongoose.model('User', userSchema);

module.exports = User;