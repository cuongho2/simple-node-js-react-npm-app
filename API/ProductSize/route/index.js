const ProductSize = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{ method: "POST", path: "/ProductSize/find", config: ProductSize.getProductSize },
	{
		method: "POST",
		path: "/ProductSize/add",
		config: ProductSize.postProductSize,
	},
	{
		method: "POST",
		path: "/ProductSize/update/{id}",
		config: ProductSize.putProductSize,
	},
	{
		method: "DELETE",
		path: "/ProductSize/delete/{id}",
		config: ProductSize.deleteProductSize,
	},
];
