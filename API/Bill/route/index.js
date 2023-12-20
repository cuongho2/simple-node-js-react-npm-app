const Bill = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{
		method: "POST",
		path: "/Bill/geList",
		config: Bill.getBill,
	},
	{ method: "POST", path: "/Bill/find", config: Bill.find },
	{
		method: "POST",
		path: "/Bill/add",
		config: Bill.postBill,
	},
	{
		method: "POST",
		path: "/Bill/update/{id}",
		config: Bill.putBill,
	},
	{
		method: "DELETE",
		path: "/Bill/delete/{id}",
		config: Bill.deleteBill,
	},
	{
		method: "POST",
		path: "/Bill/detail",
		config: Bill.findById,
	},
];
