const { Schema, model } = require('mongoose');
const Populate = require('../util/autoPopulate');

const blogSchema = new Schema(
	{
		userId: {
			type: String,
		},
		title: {
			type: String,
		},
		text: {
			type: String,
		},
		categories: {
			type: Array,
			default: [],
		},
		keywords: {
			type: Array,
			default: [],
		},
		viewedBy: {
			type: Array,
			default: [],
		},
		views: {
			type: Number,
			default: 0,
		},
		likes: {
			type: [
				{
					type: Schema.Types.ObjectId,
					ref: 'Comment',
				},
			],
			default: [],
		},
		comments: {
			type: [
				{
					type: Schema.Types.ObjectId,
					ref: 'Comment',
				},
			],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

blogSchema
	.pre('find', Populate('comments'))
	.pre('findOne', Populate('comments'))
	.pre('find', Populate('likes'))
	.pre('findOne', Populate('likes'));

module.exports = model('Blog', blogSchema);
