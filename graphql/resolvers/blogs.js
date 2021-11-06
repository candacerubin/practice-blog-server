const { Blog } = require('../../models/');

module.exports = {
	Query: {
		async getBlogs() {
			const blogs = await Blog.find();
			return blogs;
		},
	},
	Mutation: {
		async createNewBlog(
			_,
			{ newBlogInput: { userId, title, text, categories = [], keywords = [] } }
		) {
			const newBlog = await new Blog({
				userId,
				title,
				text,
				categories,
				keywords,
			});
			newBlog.save();
			return newBlog;
		},
	},
};
