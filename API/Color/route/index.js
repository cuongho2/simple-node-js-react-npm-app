const Color = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{ method: "POST", path: "/Color/getList", config: Color.getColor },
	{ method: "POST", path: "/Color/find", config: Color.find },
	{
		method: "POST",
		path: "/Color/add",
		config: Color.postColor,
	},
	{
		method: "POST",
		path: "/Color/update/{id}",
		config: Color.putColor,
	},
	{
		method: "DELETE",
		path: "/Color/delete/{id}",
		config: Color.deleteColor,
	},
];
