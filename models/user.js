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

		User.findOne({firebaseID: firebaseObj.uid}, function(err, userObj) {
			if (err || !userObj) return cb(err || "user not found");

		})		

	})
}


User = mongoose.model('User', userSchema);

module.exports = User;