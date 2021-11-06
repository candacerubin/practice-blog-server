const userResolvers = require('./users');
const blogResolvers = require('./blogs');

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
