const { Schema, model } = require('mongoose');

const likeSchema = new Schema(
	{
		usesrId: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = model('Like', likeSchema);
