const Designs = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{ method: "POST", path: "/Designs/find", config: Designs.getDesigns },
	{
		method: "POST",
		path: "/Designs/add",
		config: Designs.postDesigns,
	},
	{
		method: "POST",
		path: "/Designs/update/{id}",
		config: Designs.putDesigns,
	},
	{
		method: "DELETE",
		path: "/Designs/delete/{id}",
		config: Designs.deleteDesigns,
	},
];
