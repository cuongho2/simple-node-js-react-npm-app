const Category = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{ method: "POST", path: "/Category/getList", config: Category.getCategory },
	{ method: "POST", path: "/Category/find", config: Category.find },
	{
		method: "POST",
		path: "/Category/add",
		config: Category.postCategory,
	},
	{
		method: "POST",
		path: "/Category/update/{id}",
		config: Category.putCategory,
	},
	{
		method: "DELETE",
		path: "/Category/delete/{id}",
		config: Category.deleteCategory,
	},
];
