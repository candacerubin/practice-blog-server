const { Schema, model } = require('mongoose');
const Populate = require('../util/autoPopulate.js');

const blogSchema = new Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		text: {
			type: String,
			required: true,
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
					ref: 'Like',
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
