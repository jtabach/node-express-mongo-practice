var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.post('/register', function(req, res) {
	// req.body is recieved from user register form.
	User.register(req.body, function(err, savedUser) {
		res.status(err ? 400 : 200).send(err || savedUser);
	});
});

router.post('/login', function(req, res) {
	// req.body is recieved from user login form.
	User.login(req.body, function(err, token) {
		if (err) return res.status(400).send(err);
		res.cookie('userToken', token).send(token);
	})
})

router.get('/profile', User.isLoggedIn, function(req, res) {
	User.findOne(req.token._id, function(err, userObj) {
		res.status(err ? 400 : 200).send(err || userObj);
	})
})






/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
