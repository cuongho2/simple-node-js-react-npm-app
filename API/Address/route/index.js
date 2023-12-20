const Address = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{
		method: "POST",
		path: "/Address/geList",
		config: Address.getAddress,
	},
	{ method: "POST", path: "/Address/find", config: Address.find },
	{
		method: "POST",
		path: "/Address/add",
		config: Address.postAddress,
	},
	{
		method: "POST",
		path: "/Address/update/{id}",
		config: Address.putAddress,
	},
	{
		method: "DELETE",
		path: "/Address/delete/{id}",
		config: Address.deleteAddress,
	},
	{
		method: "POST",
		path: "/Address/detail",
		config: Address.findById,
	},
];
