/**
 * Created by A on 7/18/17.
 */
"use strict";
// User Modules
const AppUsers = require("../API/AppUsers/route/AppUsersRoute");
const Wallet = require("../API/Wallet/route/WalletRoute");
const WalletBalanceUnit = require("../API/WalletBalanceUnit/route");

//Staff modules
const Staff = require("../API/Staff/route/StaffRoute");
const Role = require("../API/Role/route/RoleRoute");
const Permission = require("../API/Permission/route/PermissionRoute");

//System & Utilites modules
const Maintain = require("../API/Maintain/route/MaintainRoute");
const Upload = require("../API/Upload/route/UploadRoute");
const SystemConfigurations = require("../API/SystemConfigurations/route");
const GeneralInformation = require("../API/GeneralInformation/route");

//Customer Schedules
const CustomerSchedule = require("../API/CustomerSchedule/route");

//Customer Message modules
const CustomerMessage = require("../API/CustomerMessage/route");

//Customer Measure modules
const CustomerMeasureRecord = require("../API/CustomerMeasureRecord/route");

//Stations Modules
const Stations = require("../API/Stations/route");

const StationProductsCategory = require("../API/StationProductsCategory/route");
const StationServices = require("../API/StationServices/route");
const StationServicesCategory = require("../API/StationServicesCategory/route");

//Payment modules
const PaymentMethod = require("../API/PaymentMethod/route");
const PaymentServicePackage = require("../API/PaymentServicePackage/route");
const PaymentRecord = require("../API/PaymentRecord/route/PaymentRecordRoute");
const PaymentDepositTransaction = require("../API/PaymentDepositTransaction/route");
const PaymentWithdrawTransaction = require("../API/PaymentWithdrawTransaction/route");
const PaymentExchangeTransaction = require("../API/PaymentExchangeTransaction/route");

//Dashboard modules
const Statistical = require("../API/Statistical/route");

// Bet Records
const BetRecords = require("../API/BetRecords/route");
const Category = require("../API/Category/route");
const Bill = require("../API/Bill/route");
//WalletBalanceUnit
var APIs = [
	//Upload APIs
	{ method: "POST", path: "/Upload/detectTextImage", config: Upload.detectTextImage },
	{ method: "POST", path: "/Upload/uploadMediaFile", config: Upload.uploadMediaFile },
	{
		method: "GET",
		path: "/{path*}",
		handler: function (request, h) {
			return h.file(`${request.params.path}`);
		},
	},
	{ method: "POST", path: "/Upload/uploadUserAvatar", config: Upload.uploadUserAvatar },
	/* ***************USER MODULES**************** */
	// AppUsers APIs
	{ method: "POST", path: "/AppUsers/registerUser", config: AppUsers.registerUser },
	{ method: "POST", path: "/AppUsers/registerUserByPhone", config: AppUsers.registerUserByPhone },
	{ method: "POST", path: "/AppUsers/loginUser", config: AppUsers.loginUser },
	{ method: "POST", path: "/AppUsers/loginByPhone", config: AppUsers.loginByPhone },
	{ method: "POST", path: "/AppUsers/loginApple", config: AppUsers.loginApple },
	{ method: "POST", path: "/AppUsers/loginFacebook", config: AppUsers.loginFacebook },
	{ method: "POST", path: "/AppUsers/loginGoogle", config: AppUsers.loginGoogle },
	{ method: "POST", path: "/AppUsers/loginZalo", config: AppUsers.loginZalo },
	{ method: "POST", path: "/AppUsers/find", config: AppUsers.find },
	{ method: "POST", path: "/AppUsers/getDetailUserById", config: AppUsers.userGetDetailById },
	{ method: "POST", path: "/AppUsers/findById", config: AppUsers.findById },
	{ method: "POST", path: "/AppUsers/updateUserById", config: AppUsers.updateById },
	{ method: "POST", path: "/AppUsers/user/deleteAccount", config: AppUsers.userDeleteAccount },
	{ method: "POST", path: "/AppUsers/changePasswordUser", config: AppUsers.changePasswordUser },
	{ method: "POST", path: "/AppUsers/updateInfoUser", config: AppUsers.userUpdateInfo },
	{ method: "POST", path: "/AppUsers/verify2FA", config: AppUsers.verify2FA },
	{ method: "GET", path: "/AppUsers/get2FACode", config: AppUsers.get2FACode },
	{ method: "POST", path: "/AppUsers/verifyInfoUser", config: AppUsers.verifyInfoUser },
	{ method: "POST", path: "/AppUsers/rejectInfoUser", config: AppUsers.rejectInfoUser },
	{ method: "POST", path: "/AppUsers/getUsersByMonth", config: AppUsers.getUsersByMonth },
	{
		method: "POST",
		path: "/AppUsers/uploadImageIdentityCardBefore",
		config: AppUsers.uploadIdentityCardBefore,
	},
	{
		method: "POST",
		path: "/AppUsers/uploadImageIdentityCardAfter",
		config: AppUsers.uploadIdentityCardAfter,
	},
	{
		method: "POST",
		path: "/AppUsers/submitImageIdentityCard",
		config: AppUsers.submitIdentityCardImage,
	},
	{ method: "POST", path: "/AppUsers/uploadAvatar", config: AppUsers.uploadAvatar },
	{ method: "POST", path: "/AppUsers/exportExcel", config: AppUsers.exportExcelFile },
	{ method: "POST", path: "/AppUsers/forgotPassword", config: AppUsers.forgotPassword },
	{ method: "POST", path: "/AppUsers/forgotPasswordOTP", config: AppUsers.forgotPasswordOTP },
	{ method: "POST", path: "/AppUsers/verifyEmailUser", config: AppUsers.verifyEmailUser },
	{
		method: "POST",
		path: "/AppUsers/userResetPassword",
		config: AppUsers.resetPasswordBaseOnToken,
	},
	{
		method: "POST",
		path: "/AppUsers/adminResetPasswordUser",
		config: AppUsers.adminResetPasswordUser,
	},
	{ method: "POST", path: "/AppUsers/sendMailToVerifyEmail", config: AppUsers.sendMailToVerify },
	{
		method: "POST",
		path: "/AppUsers/adminChangePasswordUser",
		config: AppUsers.adminChangePasswordUser,
	},
	{
		method: "POST",
		path: "/AppUsers/adminChangeSecondaryPasswordUser",
		config: AppUsers.adminChangeSecondaryPasswordUser,
	},

	{
		method: "GET", //This API use to load QRCode of user
		path: "/images/{filename}",
		handler: function (request, h) {
			return h.file(`images/${request.params.filename}`);
		},
	},
	/* ********************STAFF MODULES***************** */
	//Staff APIs
	{ method: "POST", path: "/Staff/loginStaff", config: Staff.loginStaff },
	{ method: "POST", path: "/Staff/registerStaff", config: Staff.registerStaff },
	{ method: "POST", path: "/Staff/updateStaffById", config: Staff.updateById },
	{ method: "POST", path: "/Staff/deleteStaffById", config: Staff.deleteById },
	{ method: "POST", path: "/Staff/deleteAccount", config: Staff.staffDeleteAccount },
	{ method: "POST", path: "/Staff/getListStaff", config: Staff.find },
	{ method: "POST", path: "/Staff/insertStaff", config: Staff.insert },
	{ method: "POST", path: "/Staff/getDetailStaff", config: Staff.findById },
	{ method: "POST", path: "/Staff/resetPasswordStaff", config: Staff.resetPasswordStaff },
	{ method: "POST", path: "/Staff/changePasswordStaff", config: Staff.changePasswordStaff },
	{
		method: "POST",
		path: "/Staff/adminChangePasswordStaff",
		config: Staff.adminChangePasswordStaff,
	},

	//Role APIs
	{ method: "POST", path: "/Role/insert", config: Role.insert },
	{ method: "POST", path: "/Role/getList", config: Role.find },
	// { method: 'POST', path: '/Role/getDetailById', config: Role.findById }, //currently disable - no need
	{ method: "POST", path: "/Role/updateById", config: Role.updateById },

	//Permission APIs
	// { method: 'POST', path: '/Permission/insert', config: Permission.insert },//currently disable - no need
	{ method: "POST", path: "/Permission/getList", config: Permission.find },
	// { method: 'POST', path: '/Permission/getDetailById', config: Permission.findById },//currently disable - no need
	// { method: 'POST', path: '/Permission/updateById', config: Permission.updateById },//currently disable - no need

	/******************System & Utilites modules */

	//Maintain APIs
	{ method: "POST", path: "/Maintain/maintainAll", config: Maintain.maintainAll },
	{ method: "POST", path: "/Maintain/maintainSignup", config: Maintain.maintainSignup },
	{ method: "POST", path: "/Maintain/getSystemStatus", config: Maintain.getSystemStatus },

	/****************PAYMENT MODULES ****************/
];
const Color = require("../API/Color/route");
const CustomerMealRecord = require("../API/CustomerMealRecord/route");
const Size = require("../API/Size/route");
const Designs = require("../API/Designs/route");
const Coupon = require("../API/Coupon/route");
const Products = require("../API/Products/route");
const Brand = require("../API/Brand/route");
const Discount = require("../API/Discount/route");
const CustomerComment = require("../API/CustomerComment/route");
const CustomerFavourite = require("../API/CustomerFavourite/route");
const CustomerFeeback = require("../API/CustomerFeeback/route");
const ProductSize = require("../API/ProductSize/route");
const Address = require("../API/Address/route");
// APIs = APIs.concat(WalletBalanceUnit);

// APIs = APIs.concat(BetRecords);

// APIs = APIs.concat(PaymentMethod);

// APIs = APIs.concat(PaymentWithdrawTransaction);
// APIs = APIs.concat(PaymentDepositTransaction);
// APIs = APIs.concat(PaymentExchangeTransaction);

//Customer Schedule modules
APIs = APIs.concat(PaymentServicePackage);
APIs = APIs.concat(CustomerSchedule);

//Customer Message modules
APIs = APIs.concat(CustomerMessage);

APIs = APIs.concat(CustomerMeasureRecord);

//Stations modules
APIs = APIs.concat(Stations);

APIs = APIs.concat(StationProductsCategory);
APIs = APIs.concat(StationServices);
APIs = APIs.concat(StationServicesCategory);

APIs = APIs.concat(Statistical);

APIs = APIs.concat(SystemConfigurations);
APIs = APIs.concat(GeneralInformation);

APIs = APIs.concat(CustomerMealRecord);
APIs = APIs.concat(Category);
APIs = APIs.concat(Color);
APIs = APIs.concat(Size);
APIs = APIs.concat(Designs);
APIs = APIs.concat(Coupon);
APIs = APIs.concat(Products);
APIs = APIs.concat(Brand);
APIs = APIs.concat(Discount);
APIs = APIs.concat(CustomerComment);
APIs = APIs.concat(CustomerFavourite);
APIs = APIs.concat(CustomerFeeback);
APIs = APIs.concat(ProductSize);
APIs = APIs.concat(Bill);
APIs = APIs.concat(Address);
module.exports = APIs;
