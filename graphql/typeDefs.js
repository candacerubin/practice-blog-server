const { gql } = require('apollo-server-express');

module.exports = gql`
	type User {
		id: ID!
		displayName: String
		spotifyId: String
		googleId: String
		facebookId: String
		email: String!
		token: String!
		createdAt: String!
	}

	input RegisterInput {
		email: String!
		displayName: String!
		password: String!
		confirmPassword: String!
	}

	input LoginInput {
		email: String!
		password: String!
	}

	input UpdatePasswordInput {
		password: String!
		newPassword: String!
		confirmNewPassword: String!
	}

	input UpdateUserInput {
		email: String
		displayName: String
	}

	type Query {
		getUser(userId: ID!): User
		getUsers: [User]
	}

	type Mutation {
		# Auth
		register(registerInput: RegisterInput): User!
		login(loginInput: LoginInput): User!

		# User
		updatePassword(updatePasswordInput: UpdatePasswordInput): User
		updateUser(updateUserInput: UpdateUserInput): User
	}
`;
