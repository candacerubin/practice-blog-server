const { validateDisplayName, validateNewEmail } = require('./genericValidators');

async function validateProfileInput(newProfileInput, originalProfile) {
	const { password, salt, hash, email, displayName } = newProfileInput;
	if (password || salt || hash)
		return new error('Please use the auth REST api to update credentials');

	if (displayName) {
		const displayNameError = validateDisplayName(displayName, originalProfile.displayName);
		if (displayNameError) return displayNameError;
	}

	if (email) {
		const emailError = validateNewEmail(email, originalProfile.email);
		if (emailError) return emailError;
	}

	return null;
}

module.exports = {
	validateProfileInput,
};
