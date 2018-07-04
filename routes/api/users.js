const express = require('express');
const router = express.Router();

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
	User.findOne({ email: req.body.email })// find email of User that try to register
		.then(user => {
			if(user) {
				return res.status(400).json({email: "Email already exists"});
			} else {
				const newUser = new User({
					name: req.body.name,
					email: req.body.email,
					avatar,
					password: req.body.password
				});
			}
		})
});

module.exports = router;