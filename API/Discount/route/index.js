const Discount = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{ method: "POST", path: "/Discount/find", config: Discount.getDiscount },
	{
		method: "POST",
		path: "/Discount/add",
		config: Discount.postDiscount,
	},
	{
		method: "POST",
		path: "/Discount/update/{id}",
		config: Discount.putDiscount,
	},
	{
		method: "DELETE",
		path: "/Discount/delete/{id}",
		config: Discount.deleteDiscount,
	},
];
