const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs'); //encrypt password
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User module

const User = require('../../modules/User');

//Only Autentification!!!
// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));


// @route   GET api/users/register
// @desc    Register User
// @access  Public
router.post('/register', (req, res) => {
	User.findOne({ email: req.body.email }) // find email of User that try to register
		.then(user => {
			if (user) {
				return res.status(400).json({ email: "Email already exists" });
			} else {
				const avatar = gravatar.url(req.body.email, {
					s: '200', // Size
					r: 'pg', //Rating
					d: 'mm' //Default
				});

				const newUser = new User({
					name: req.body.name,
					email: req.body.email,
					avatar,
					password: req.body.password
				});

				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						newUser.save()
							.then(user => res.json(user))
							.catch(err => console.log(err));
					})
				})
			}
		})
});


// Json web token module - creates the token !!!!!!!!!!!!!!!!!!!!!!!!
// passport - validate and extract users info
// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post('/login', (req, res) => {
	const { errors, isValid } = validateLoginInput(req.body);

	// Check Validation
	if (!isValid) {
		return res.status(400).json(errors);
	}

	const email = req.body.email;
	const password = req.body.password;

	// Find user by email
	User.findOne({ email }).then(user => {
		// Check for user
		if (!user) {
			errors.email = 'User is not found';
			return res.status(404).json(errors);
		}

		// Check Password
		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				// User Matched
				const payload = { id: user.id, name: user.name, avatar: user.avatar }; // Create JWT Payload
				// payload,// what we wanna include
				// Sign Token
				jwt.sign(
					payload,
					keys.secretOrKey, { expiresIn: 3600 }, // 3600 - after hour the key should be deleted
					(err, token) => {
						res.json({
							success: true,
							token: 'Bearer ' + token // Bearer - type of protocol
						});
					}
				);
			} else {
				errors.password = 'Password is incorrect';
				return res.status(400).json(errors);
			}
		});
	});
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
// jwt - strategy
router.get('/current', passport.authenticate('jwt', { session: false }),
	(req, res) => {
		res.json({
			id: req.user.id,
			name: req.user.name,
			email: req.user.email
		});
	}
);


module.exports = router;