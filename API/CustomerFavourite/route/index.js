const CustomerFavourite = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{
		method: "POST",
		path: "/CustomerFavourite/geList",
		config: CustomerFavourite.getCustomerFavourite,
	},
	{ method: "POST", path: "/CustomerFavourite/find", config: CustomerFavourite.find },
	{
		method: "POST",
		path: "/CustomerFavourite/add",
		config: CustomerFavourite.postCustomerFavourite,
	},
	{
		method: "POST",
		path: "/CustomerFavourite/update/{id}",
		config: CustomerFavourite.putCustomerFavourite,
	},
	{
		method: "DELETE",
		path: "/CustomerFavourite/delete/{id}",
		config: CustomerFavourite.deleteCustomerFavourite,
	},
];
