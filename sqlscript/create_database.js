//App User Modules
const AppUsers = require("../API/AppUsers/resourceAccess/AppUsersResourceAccess");
const AppUserView = require("../API/AppUsers/resourceAccess/AppUserView");
const Wallet = require("../API/Wallet/resourceAccess/WalletResourceAccess");
const WalletBalanceView = require("../API/Wallet/resourceAccess/WalletBalanceUnitView");
const WalletAppUserView = require("../API/AppUsers/resourceAccess/WalletAppUserView");
const WalletBalanceUnit = require("../API/WalletBalanceUnit/resourceAccess/WalletBalanceUnitResourceAccess");
const AppUserServiceResourceAccess = require("../API/AppUserService/resourceAccess/AppUserServiceResourceAccess");

//Staff modules
const Staff = require("../API/Staff/resourceAccess/StaffResourceAccess");
const Role = require("../API/Role/resourceAccess/RoleResourceAccess");
const RoleStaffView = require("../API/Staff/resourceAccess/RoleStaffView");
const RoleStaffStationView = require("../API/Staff/resourceAccess/RoleStaffStationView");
const Permission = require("../API/Permission/resourceAccess/PermissionResourceAccess");
const SystemAppLog = require("../API/SystemAppChangedLog/resourceAccess/SystemAppChangedLogResourceAccess");
const UploadResource = require("../API/Upload/resourceAccess/UploadResourceAccess");

//Stations Modules
const Stations = require("../API/Stations/resourceAccess/StationsResourceAccess");

const StationProductsCategory = require("../API/StationProductsCategory/resourceAccess/StationProductsCategoryResourceAccess");
const StationServices = require("../API/StationServices/resourceAccess/StationServicesResourceAccess");
const StationServicesCategory = require("../API/StationServicesCategory/resourceAccess/StationServicesCategoryResourceAccess");

//SystemConfigurations modules
const SystemConfigurations = require("../API/SystemConfigurations/resourceAccess/SystemConfigurationsResourceAccess");
const GeneralInformation = require("../API/GeneralInformation/resourceAccess/GeneralInformationResourceAccess");

//Payment modules
const PaymentMethod = require("../API/PaymentMethod/resourceAccess/PaymentMethodResourceAccess");
const PaymentRecord = require("../API/PaymentRecord/resourceAccess/PaymentRecordResourceAccess");
const PaymentDepositResource = require("../API/PaymentDepositTransaction/resourceAccess/PaymentDepositTransactionResourceAccess");
const PaymentDepositUserView = require("../API/PaymentDepositTransaction/resourceAccess/PaymentDepositTransactionUserView");
const SummaryUserPaymentDepositTransactionView = require("../API/PaymentDepositTransaction/resourceAccess/SummaryUserPaymentDepositTransactionView");
const PaymentExchangeResource = require("../API/PaymentExchangeTransaction/resourceAccess/PaymentExchangeTransactionResourceAccess");
const PaymentExchangeUserView = require("../API/PaymentExchangeTransaction/resourceAccess/ExchangeTransactionUserView");
const SummaryUserExchangeTransactionView = require("../API/PaymentExchangeTransaction/resourceAccess/SummaryUserExchangeTransactionView");
const PaymentWithdrawResource = require("../API/PaymentWithdrawTransaction/resourceAccess/PaymentWithdrawTransactionResourceAccess");
const SummaryUserWithdrawTransactionView = require("../API/PaymentWithdrawTransaction/resourceAccess/SummaryUserWithdrawTransactionView");
const WithdrawTransactionUserView = require("../API/PaymentWithdrawTransaction/resourceAccess/WithdrawTransactionUserView");

//PaymentServicePackage
const PaymentServicePackage = require("../API/PaymentServicePackage/resourceAccess/PaymentServicePackageResourceAccess");
const PaymentServicePackageUserResourceAccess = require("../API/PaymentServicePackage/resourceAccess/PaymentServicePackageUserResourceAccess");
const ServicePackageUserViews = require("../API/PaymentServicePackage/resourceAccess/ServicePackageUserViews");
const ServicePackageWalletViews = require("../API/PaymentServicePackage/resourceAccess/ServicePackageWalletViews");
const ServicePackageUnitViews = require("../API/PaymentServicePackage/resourceAccess/PackageUnitView");
const UserBonusPackage = require("../API/PaymentServicePackage/resourceAccess/UserBonusPackageResourceAccess");
const SummaryPaymentServicePackageUserView = require("../API/PaymentServicePackage/resourceAccess/SummaryPaymentServicePackageUserView");

const BetRecordsResource = require("../API/BetRecords/resourceAccess/BetRecordsResourceAccess");
const UserBetRecordsViews = require("../API/BetRecords/resourceAccess/UserBetRecordsView");

const CustomerMessage = require("../API/CustomerMessage/resourceAccess/CustomerMessageResourceAccess");
const GroupCustomerMessage = require("../API/CustomerMessage/resourceAccess/GroupCustomerMessageResourceAccess");
// Shofi
const Category = require("../API/Category/resourceAccess/ResourceAccess");
const Color = require("../API/Color/resourceAccess/ResourceAccess");
const Size = require("../API/Size/resourceAccess/ResourceAccess");
const Designs = require("../API/Designs/resourceAccess/ResourceAccess");
const Coupon = require("../API/Coupon/resourceAccess/ResourceAccess");
const Products = require("../API/Products/resourceAccess/ProductsResourceAccess");
const Brand = require("../API/Brand/resourceAccess/ResourceAccess");
const Discount = require("../API/Discount/resourceAccess/ResourceAccess");
const CustomerComment = require("../API/CustomerComment/resourceAccess/ResourceAccess");
const CustomerFavourite = require("../API/CustomerFavourite/resourceAccess/ResourceAccess");
const CustomerFeeback = require("../API/CustomerFeeback/resourceAccess/ResourceAccess");
const ProductSize = require("../API/ProductSize/resourceAccess/ResourceAccess");
const Bill = require("../API/Bill/resourceAccess/ResourceAccess");
const Address = require("../API/Address/resourceAccess/ResourceAccess");
async function createDatabase() {
	//*************CREATE TABLES******************
	// ////User modules
	// await AppUsers.initDB(); // << khi reset user nhớ reset Wallet để nó ra ví tương ứng
	// await Wallet.initDB();
	// await WalletBalanceUnit.initDB();
	// await WalletBalanceView.initViews();
	// await WalletAppUserView.initViews();
	// await AppUserView.initViews();
	// await AppUserServiceResourceAccess.initDB();
	// ////Staff modules
	// await Permission.initDB();
	// await Role.initDB();
	// await Staff.initDB();
	// await RoleStaffView.initViews();
	// await RoleStaffStationView.initViews();
	// //System / Utilities modules
	// await SystemAppLog.initDB();
	// await UploadResource.initDB();
	//Customer Schedule Modules
	// const CustomerSchedule = require("../API/CustomerSchedule/resourceAccess/CustomerScheduleResourceAccess");
	// const CustomerScheduleStaffServiceView = require("../API/CustomerSchedule/resourceAccess/CustomerScheduleStaffServiceView");
	// await CustomerSchedule.initDB();
	// await CustomerScheduleStaffServiceView.initViews();
	//// Stations Modules
	// await Stations.initDB();
	// await StationProductsCategory.initDB();
	// await StationServices.initDB();
	// await StationServicesCategory.initDB();
	//// SystemConfigurations
	// await SystemConfigurations.initDB();
	// await GeneralInformation.initDB();
	//// Messages modules
	// await CustomerMessage.initDB();
	// await GroupCustomerMessage.initDB();
	//PaymentServicePackage modules
	// await PaymentServicePackage.initDB();
	// await PaymentServicePackageUserResourceAccess.initDB();
	// await ServicePackageUserViews.initViews();
	// await ServicePackageWalletViews.initViews();
	// await ServicePackageUnitViews.initViews();
	// await UserBonusPackage.initDB();
	// await SummaryPaymentServicePackageUserView.initViews();
	// const CustomerMealRecord = require('../API/CustomerMealRecord/resourceAccess/CustomerMealRecordResourceAccess');
	// await CustomerMealRecord.initDB();
	// await Category.initDB();
	// await Color.initDB();
	// await Size.initDB();
	// await Designs.initDB();
	// await Coupon.initDB();
	// await Products.initDB();
	// await Brand.initDB();
	// await Discount.initDB();
	// await CustomerComment.initDB();
	// await CustomerFavourite.initDB();
	// await CustomerFeeback.initDB();
	// await ProductSize.initDB();
	await Bill.initDB();
	// await Address.initDB();
}
createDatabase();
