const { UserInputError } = require('apollo-server-express');

const User = require('../../models/User.js');
const {
	hasSpace,
	startsNumerical,
	isGreaterThan,
	hasAtLeastOneCharacter,
	hasAtLeastOneCap,
	hasAtLeastOneLower,
	isLessThan,
	containsANumber,
} = require('../../util/readableStringFunctions.js');

async function validateDisplayName(newDN, oldDN) {
	/** Display names must be unique */
	const searchResults = await User.find({ displayName: newDN });
	const exists = (await searchResults.filter((x) => x.displayName !== oldDN).length) > 0;

	if (exists)
		return new UserInputError('DISPLAY_NAME_EXISTS', {
			errors: { displayName: 'This display name is taken' },
		});

	/** Check if new display name has a space in it */
	if (hasSpace(newDN))
		return new UserInputError('NO_SPACES_IN_DISPLAY_NAME', {
			errors: { displayName: 'Spaces are not allowed in display names' },
		});

	/** Check if display name starts with a number */
	if (startsNumerical(newDN))
		return new UserInputError('CANT_START_WITH_NUMBER', {
			errors: { displayName: 'Display names can not start with a number' },
		});

	/** Name can not be longer than 15 characters */
	if (isGreaterThan(15, newDN))
		return new UserInputError('FIFTEEN_CHARACTER_MAX', {
			errors: {
				displayName: 'Display name cant be more than 15 characters',
			},
		});

	return null;
}

async function validateNewEmail(newEmail, original) {
	const searchResults = await User.find({ email: newEmail });
	const exists = (await searchResults.filter((x) => x.email !== original || !original).length) > 0;

	if (exists)
		return new UserInputError('EMAIL_ALREADY_REGISTERED', {
			errors: { email: `email ${newEmail} is already registered` },
		});

	const syntaxError = await validateEmail(newEmail);
	if (syntaxError) {
		return syntaxError;
	}
}

function validatePassword(newPassword) {
	if (isLessThan(6, newPassword))
		return new UserInputError('PASSWORD_SIX_CHARACTER_MIN', {
			errors: { password: 'Passwords must be at least 6 characters long' },
		});
	if (!hasAtLeastOneLower(newPassword))
		return new UserInputError('PASSWORD_MUST_HAVE_LOWER', {
			errors: { password: 'Passwords must include at least 1 lower case letter' },
		});
	if (!hasAtLeastOneCap(newPassword))
		return new UserInputError('PASSWORD_MUST_HAVE_CAPITAL', {
			errors: { password: 'Passwords must include at least 1 capital letter' },
		});
	if (!containsANumber(newPassword))
		return new UserInputError('PASSWORD_MUST_HAVE_NUMBER', {
			errors: { password: 'Passwords must include at least 1 number' },
		});
	if (!hasAtLeastOneCharacter(newPassword))
		return new UserInputError('PASSWORD_MUST_HAVE_CHARACTER', {
			errors: {
				password: 'Passwords must include at least 1 special character (i.e. !@#$%^&*)',
			},
		});
	return null;
}

function validateEmail(emailAddress) {
	if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailAddress)) {
		return new UserInputError('EMAIL_VALIDATION', {
			errors: {
				email: 'Please enter a valid email address',
			},
		});
	}
	return null;
}

module.exports = {
	validateDisplayName,
	validateNewEmail,
	validateEmail,
	validatePassword,
};
