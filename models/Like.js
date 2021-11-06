const { Schema, model } = require('mongoose');

const likeSchema = new Schema(
	{
		userId: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = model('Like', likeSchema);
