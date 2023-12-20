const Brand = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{ method: "POST", path: "/Brand/geList", config: Brand.getBrand },
	{ method: "POST", path: "/Brand/find", config: Brand.find },
	{
		method: "POST",
		path: "/Brand/add",
		config: Brand.postBrand,
	},
	{
		method: "POST",
		path: "/Brand/update/{id}",
		config: Brand.putBrand,
	},
	{
		method: "DELETE",
		path: "/Brand/delete/{id}",
		config: Brand.deleteBrand,
	},
];
