const CustomerFeeback = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{ method: "POST", path: "/CustomerFeeback/geList", config: CustomerFeeback.getCustomerFeeback },
	{ method: "POST", path: "/CustomerFeeback/find", config: CustomerFeeback.find },
	{
		method: "POST",
		path: "/CustomerFeeback/add",
		config: CustomerFeeback.postCustomerFeeback,
	},
	{
		method: "POST",
		path: "/CustomerFeeback/update/{id}",
		config: CustomerFeeback.putCustomerFeeback,
	},
	{
		method: "DELETE",
		path: "/CustomerFeeback/delete/{id}",
		config: CustomerFeeback.deleteCustomerFeeback,
	},
];
