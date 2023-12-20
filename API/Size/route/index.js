const Size = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{ method: "POST", path: "/Size/find", config: Size.getSize },
	{
		method: "POST",
		path: "/Size/add",
		config: Size.postSize,
	},
	{
		method: "POST",
		path: "/Size/update/{id}",
		config: Size.putSize,
	},
	{
		method: "DELETE",
		path: "/Size/delete/{id}",
		config: Size.deleteSize,
	},
];
