const CustomerComment = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{ method: "POST", path: "/CustomerComment/geList", config: CustomerComment.getCustomerComment },
	{ method: "POST", path: "/CustomerComment/find", config: CustomerComment.find },
	{
		method: "POST",
		path: "/CustomerComment/add",
		config: CustomerComment.postCustomerComment,
	},
	{
		method: "POST",
		path: "/CustomerComment/update/{id}",
		config: CustomerComment.putCustomerComment,
	},
	{
		method: "DELETE",
		path: "/CustomerComment/delete/{id}",
		config: CustomerComment.deleteCustomerComment,
	},
];
