const StationProduct = require("./ProductsRoute");
const StationProduct_User = require("./Products_UserRoute");

module.exports = [
	//Api StationProduct
	{ method: "POST", path: "/Products/insert", config: StationProduct.insert },
	{ method: "POST", path: "/Products/updateById", config: StationProduct.updateById },
	{ method: "POST", path: "/Products/findById", config: StationProduct.findById },
	{ method: "POST", path: "/Products/find", config: StationProduct.find },
	{ method: "POST", path: "/Products/deleteById", config: StationProduct.deleteById },
	{
		method: "POST",
		path: "/Products/getList",
		config: StationProduct_User.userGetListProduct,
	},
	{
		method: "POST",
		path: "/Products/user/getDetail",
		config: StationProduct_User.userGetDetailProduct,
	},
];
