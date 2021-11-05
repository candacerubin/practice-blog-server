const express = require('express');
const axios = require('axios');
const passport = require('passport');

const cors = require('./cors');
const auth = require('./authenticate.js');
const User = require('../models/User.js');
const { jsonRESPONSE } = require('../util/responseHelpers.js');
const { validatePassword, validateNewEmail, validateDisplayName } = require('./authValidators.js');

const authRouter = express.Router();

authRouter
	.route('/signup')
	.options(cors.cors, (_, res) => res.sendStatus(200))
	.post(cors.cors, passwordMiddleware, async (req, res) => {
		/** --> Req Body */
		const { email, password, confirmPassword, displayName } = req.body;

		/** --> PASSWORD format validation already done in middlware */
		/** --> PASSWORD match validation */
		if (password !== confirmPassword)
			return jsonRESPONSE(400, res, {
				errors: {
					password: 'Passwords do not match',
				},
			});
		console.log('finished email validate');
		/** --> EMAIL Validation */
		const emailErrors = await validateNewEmail(email);
		if (emailErrors) return jsonRESPONSE(emailErrors.status, res, emailErrors);
		console.log('finished email validate');

		/** --> DISPLAY NAME Validation */
		const displayNameErrors = await validateDisplayName(displayName);
		console.log(displayNameErrors);
		if (displayNameErrors) return jsonRESPONSE(displayNameErrors.status, res, displayNameErrors);
		console.log('finished dn validate');
		/** --> REGISTER New User */
		User.register(new User({ email, displayName }), password, (err, user) => {
			if (err) return jsonRESPONSE(500, res, { errors: err });

			user.save((err) => {
				if (err)
					return jsonRESPONSE(500, res, {
						errors: { server: 'There was a server error' },
					});

				return passport.authenticate('local')(req, res, () =>
					jsonRESPONSE(200, res, {
						token: auth.getToken({ _id: req.user._id }),
						success: true,
						status: 'Registration Successful',
						user,
					})
				);
			});
		});
	});

authRouter
	.route('/google/token')
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.corsWithOptions, passport.authenticate('google-token'), (req, res) => {
		return jsonRESPONSE(200, res, {
			success: true,
			token: auth.getToken({ _id: req.user._id }),
			status: 'You are successfully logged in!',
			user: req.user,
		});
	});

authRouter
	.route('/facebook/token')
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.corsWithOptions, passport.authenticate('facebook-token'), (req, res) =>
		jsonRESPONSE(200, res, {
			success: true,
			token: auth.getToken({ _id: req.user._id }),
			status: 'You are successfully logged in!',
			user: req.user,
		})
	);

authRouter
	.route('/spotify/token')
	.options(cors.corsWithOptions, (_, res) => res.sendStatus(200))
	.post(cors.corsWithOptions, (req, res, next) => {
		if (req.body.token) {
			const bearer = `Bearer ${req.body.token}`;
			axios
				.get('https://api.spotify.com/v1/me', {
					headers: {
						Authorization: bearer,
					},
				})
				.then(({ data: profile }) => {
					User.findOne({ spotifyId: profile.id }, async (err, user) => {
						if (err)
							return jsonRESPONSE(500, res, {
								success: false,
								status: 'There was an error',
								errorMsg: err,
							});

						if (!err && user)
							return jsonRESPONSE(200, res, {
								success: true,
								status: 'You are successfully logged in!',
								token: auth.getToken({ _id: user._id }),
								user,
							});

						const emailErr = await validateNewEmail(profile.email);
						if (emailErr) return done(emailErr, false);

						let newUser = new User({
							displayName: profile.email.split('@')[0],
							email: profile.email,
							spotifyId: profile.id,
						});
						newUser.save();

						return jsonRESPONSE(200, res, {
							success: true,
							status: 'You are successfully logged in!',
							token: auth.getToken({ _id: newUser._id }),
							user: newUser,
						});
					});
				})
				.catch((err) => next(err));
		}
	});

authRouter.post('/login', cors.cors, passwordMiddleware, passport.authenticate('local'), (req, res) =>
	req.user
		? jsonRESPONSE(200, res, {
				success: true,
				token: auth.getToken({ _id: req.user._id }),
				status: 'You are successfully logged in!',
				user: req.user,
		  })
		: jsonRESPONSE(400, res)
);

authRouter
	.route('/change-password')
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.post(cors.cors, passwordMiddleware, passport.authenticate('local'), (req, res) => {
		User.findByUsername(req.user.email).then((user) => {
			const { newPassword, confirmNewPassword } = req.body;
			if (newPassword === confirmNewPassword)
				return user.setPassword(newPassword, () => {
					user.save();
					return jsonRESPONSE(200, res, {
						user: req.user,
						token: auth.getToken({ _id: user._id }),
						user,
						success: true,
					});
				});

			return jsonRESPONSE(400, res, {
				errors: { confirmNewPassword: 'Passwords do not match' },
			});
		});
	});

async function passwordMiddleware(req, res, next) {
	const { password, newPassword, confirmNewPassword } = req.body;

	let missingFieldsErrors = {};
	if (password === '') missingFieldsErrors.password = 'You need to enter a password';
	if (newPassword === '')
		missingFieldsErrors.newPassword = 'We can not assign you a new password if you do not provide one.';
	if (confirmNewPassword === '')
		missingFieldsErrors.confirmNewPassword = 'You need to confirm the new password please.';

	console.log(missingFieldsErrors);
	if (Object.keys(missingFieldsErrors).length > 0)
		return jsonRESPONSE(400, res, { errors: missingFieldsErrors, status: 400, msg: 'MISSING_INPUT' });

	if (password) {
		const pwError = await validatePassword(password);
		if (pwError)
			return jsonRESPONSE(pwError.status, res, {
				status: pwError.status,
				msg: pwError.msg,
				errors: pwError.errors,
			});
	}

	if (newPassword) {
		if (newPassword !== confirmNewPassword)
			return jsonRESPONSE(400, res, {
				errors: { confirmNewPassword: 'Passwords do not match' },
			});
		const npwError = await validatePassword(newPassword, 'newPassword');
		const cnpwError = await validatePassword(confirmNewPassword, 'confirmNewPassword');

		if (npwError)
			return jsonRESPONSE(npwError.status, res, {
				status: npwError.status,
				msg: npwError.msg,
				errors: npwError.errors,
			});
		if (cnpwError)
			return jsonRESPONSE(cnpwError.status, res, {
				status: cnpwError.status,
				msg: cnpwError.msg,
				errors: cnpwError.errors,
			});
	}

	next();
}

module.exports = authRouter;
