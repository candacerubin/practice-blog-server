const assembledValidators = require('./assembledValidators.js');
const genericValidators = require('./genericValidators.js');

module.exports = {
	...assembledValidators,
	...genericValidators,
};
