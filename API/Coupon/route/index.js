const Coupon = require("./Route");

module.exports = [
	//Api CustomerSchedule
	{ method: "POST", path: "/Coupon/getList", config: Coupon.getCoupon },
	{ method: "POST", path: "/Coupon/find", config: Coupon.find },
	{
		method: "POST",
		path: "/Coupon/add",
		config: Coupon.postCoupon,
	},
	{
		method: "POST",
		path: "/Coupon/update/{id}",
		config: Coupon.putCoupon,
	},
	{
		method: "POST",
		path: "/Coupon/detail",
		config: Coupon.findById,
	},
	{
		method: "DELETE",
		path: "/Coupon/delete/{id}",
		config: Coupon.deleteCoupon,
	},
];
