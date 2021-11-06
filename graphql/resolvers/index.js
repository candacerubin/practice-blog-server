const userResolvers = require('./users');
const blogResolvers = require('./users');

module.exports = {
	Query: {
		...userResolvers.Query,
		...blogResolvers.Query,
	},
	Mutation: {
		...userResolvers.Mutation,
		...blogResolvers.Mutation,
	},
};
