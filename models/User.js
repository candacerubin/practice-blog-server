const { Schema, model } = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
		},
		displayName: {
			type: String,
			required: true,
		},
		blogs: {
			type: Array,
			default: [],
		},
		following: {
			type: Array,
			default: [],
		},
		bookmarks: {
			type: Array,
			default: [],
		},
		googleId: {
			type: String,
			default: '',
		},
		facebookId: {
			type: String,
			default: '',
		},
		spotifyId: {
			type: String,
			default: '',
		},
		lastLogin: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = model('User', userSchema);
