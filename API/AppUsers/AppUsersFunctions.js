/**
 * Created by A on 7/18/17.
 */
"use strict";

const crypto = require("crypto");
const otplib = require("otplib");

const AppUsersResourceAccess = require("./resourceAccess/AppUsersResourceAccess");
const WalletBalanceUnitView = require("../Wallet/resourceAccess/WalletBalanceUnitView");
const WalletResource = require("../Wallet/resourceAccess/WalletResourceAccess");
const CustomerMessageResourceAccess = require("../CustomerMessage/resourceAccess/CustomerMessageResourceAccess");

const QRCodeFunction = require("../../ThirdParty/QRCode/QRCodeFunctions");
const TokenFunction = require("../ApiUtils/token");
const Logger = require("../../utils/logging");
const EmailClient = require("../../ThirdParty/Email/EmailClient");
const moment = require("moment");
const WALLET_TYPE = require("../Wallet/WalletConstant").WALLET_TYPE;
/** Gọi ra để sử dụng đối tượng "authenticator" của thằng otplib */
const { authenticator } = otplib;
const {
	USER_VERIFY_INFO_STATUS,
	USER_VERIFY_EMAIL_STATUS,
	USER_VERIFY_PHONE_NUMBER_STATUS,
	USER_TYPE,
	USER_ERROR,
	USER_MEMBER_LEVEL,
} = require("./AppUserConstant");
/** Tạo secret key ứng với từng user để phục vụ việc tạo otp token.
  * Lưu ý: Secret phải được gen bằng lib otplib thì những app như
    Google Authenticator hoặc tương tự mới xử lý chính xác được.
  * Các bạn có thể thử để linh linh cái secret này thì đến bước quét mã QR sẽ thấy có lỗi ngay.
*/
const generateUniqueSecret = () => {
	return authenticator.generateSecret();
};

/** Tạo mã OTP token */
const generateOTPToken = (username, serviceName, secret) => {
	return authenticator.keyuri(username, serviceName, secret);
};

async function getUnreadNotificationCount(foundUser) {
	//lay so luong thong bao chua doc cua user
	let unreadNotifications = await CustomerMessageResourceAccess.count({
		customerId: foundUser.appUserId,
		isRead: 0,
	});
	foundUser.unreadNotifications = unreadNotifications[0].count;
}

function hashPassword(password) {
	const hashedPassword = crypto
		.createHmac("sha256", "ThisIsSecretKey")
		.update(password)
		.digest("hex");
	return hashedPassword;
}

function unhashPassword(hash) {
	const pass = cryptr.decrypt(hash);
	return pass;
}

function verifyUniqueUser(req, res) {
	// Find an entry from the database that
	// matches either the email or username
}

async function verifyUserCredentials(username, password) {
	let hashedPassword = hashPassword(password);
	// Find an entry from the database that
	// matches either the email or username
	let verifyResult = await AppUsersResourceAccess.find({
		username: username,
		password: hashedPassword,
	});

	if (verifyResult && verifyResult.length > 0) {
		let foundUser = verifyResult[0];

		foundUser = await retrieveUserDetail(foundUser.appUserId);

		return foundUser;
	} else {
		return undefined;
	}
}

async function verifyUserSecondaryPassword(username, secondaryPassword) {
	let hashedPassword = hashPassword(secondaryPassword);
	// Find an entry from the database that
	// matches either the email or username
	let verifyResult = await AppUsersResourceAccess.find({
		username: username,
		secondaryPassword: hashedPassword,
	});

	if (verifyResult && verifyResult.length > 0) {
		let foundUser = verifyResult[0];

		foundUser = await retrieveUserDetail(foundUser.appUserId);

		return foundUser;
	} else {
		return undefined;
	}
}

async function retrieveUserDetail(appUserId) {
	//get user detial
	let user = await AppUsersResourceAccess.find({ appUserId: appUserId });
	if (user && user.length > 0) {
		let foundUser = user[0];
		delete foundUser.password;
		//create new login token
		let token = TokenFunction.createToken(foundUser);
		foundUser.token = token;

		//retrive user wallet info
		let wallets = await WalletBalanceUnitView.find({ appUserId: appUserId });
		if (wallets && wallets.length > 0) {
			foundUser.wallets = wallets;
		}

		//neu la user dai ly thi se co QRCode gioi thieu
		let referLink = process.env.WEB_HOST_NAME + `/register?refer=${foundUser.username}`;
		const QRCodeImage = await QRCodeFunction.createQRCode(referLink);
		if (QRCodeImage) {
			foundUser.referLink = referLink;
			foundUser.referQRCode = `https://${process.env.HOST_NAME}/${QRCodeImage}`;
		}

		//lay so luong thong bao chua doc cua user
		await getUnreadNotificationCount(foundUser);

		return foundUser;
	}

	return undefined;
}

async function changeUserPassword(userData, newPassword) {
	let newHashPassword = hashPassword(newPassword);

	let result = await AppUsersResourceAccess.updateById(userData.appUserId, {
		password: newHashPassword,
	});

	if (result) {
		return result;
	} else {
		return undefined;
	}
}

async function changeUserSecondaryPassword(userData, newPassword) {
	let newHashPassword = hashPassword(newPassword);

	let result = await AppUsersResourceAccess.updateById(userData.appUserId, {
		secondaryPassword: newHashPassword,
	});

	if (result) {
		return result;
	} else {
		return undefined;
	}
}

async function generate2FACode(appUserId) {
	// đây là tên ứng dụng của các bạn, nó sẽ được hiển thị trên app Google Authenticator hoặc Authy sau khi bạn quét mã QR
	const serviceName = process.env.HOST_NAME || "trainingdemo.makefamousapp.com";

	let user = await AppUsersResourceAccess.find({ appUserId: appUserId });

	if (user && user.length > 0) {
		user = user[0];

		// Thực hiện tạo mã OTP
		let topSecret = "";
		if (user.twoFACode || (user.twoFACode !== "" && user.twoFACode !== null)) {
			topSecret = user.twoFACode;
		} else {
			topSecret = generateUniqueSecret();
		}

		const otpAuth = generateOTPToken(user.username, serviceName, topSecret);
		const QRCodeImage = await QRCodeFunction.createQRCode(otpAuth);

		if (QRCodeImage) {
			await AppUsersResourceAccess.updateById(appUserId, {
				twoFACode: topSecret,
				twoFAQR: process.env.HOST_NAME + `/User/get2FACode?appUserId=${appUserId}`,
			});
			return QRCodeImage;
		}
	}
	return undefined;
}

/** Kiểm tra mã OTP token có hợp lệ hay không
 * Có 2 method "verify" hoặc "check", các bạn có thể thử dùng một trong 2 tùy thích.
 */
const verify2FACode = (token, topSecret) => {
	return authenticator.check(token, topSecret);
};

async function createNewUser(userData) {
	return new Promise(async (resolve, reject) => {
		//check existed username
		let _existedUsers = await AppUsersResourceAccess.find({ username: userData.username });
		if (_existedUsers && _existedUsers.length > 0) {
			reject(USER_ERROR.DUPLICATED_USER);
			return;
		}

		//check existed email
		if (userData.email) {
			_existedUsers = await AppUsersResourceAccess.find({ email: userData.email });
			if (_existedUsers && _existedUsers.length > 0) {
				reject(USER_ERROR.DUPLICATED_USER_EMAIL);
				return;
			}
		}

		//check existed phoneNumber
		if (userData.phoneNumber) {
			_existedUsers = await AppUsersResourceAccess.find({
				phoneNumber: userData.phoneNumber,
			});
			if (_existedUsers && _existedUsers.length > 0) {
				reject(USER_ERROR.DUPLICATED_USER_PHONE);
				return;
			}
		}

		//hash password
		userData.password = hashPassword(userData.password);
		if (
			userData.userAvatar === null ||
			userData.userAvatar === undefined ||
			userData.userAvatar === ""
		) {
			userData.userAvatar = `https://${process.env.HOST_NAME}/uploads/avatar.png`;
		}

		//if system support for secondary password, (2 step authentication)
		if (userData.secondaryPassword) {
			userData.secondaryPassword = hashPassword(userData.secondaryPassword);
		}

		//check refer user by refer's username
		if (userData.referUser && userData.referUser.trim() !== "") {
			let referUser = await AppUsersResourceAccess.find(
				{ username: userData.referUser },
				0,
				1,
			);
			if (referUser && referUser.length > 0) {
				userData.referUserId = referUser[0].appUserId;
			} else {
				Logger.info(`invalid refer user ${userData.referUser}`);
				reject(USER_ERROR.INVALID_REFER_USER);
			}
		}
		//create new user
		let addResult = await AppUsersResourceAccess.insert(userData);
		if (addResult === undefined) {
			Logger.info("can not insert user " + JSON.stringify(userData));
			reject(USER_ERROR.DUPLICATED_USER);
		} else {
			let newUserId = addResult[0];
			await generate2FACode(newUserId);

			//Create wallet for user
			let newWalletData = [
				{
					appUserId: newUserId,
					walletType: WALLET_TYPE.POINT, //vi diem
				},
			];
			await WalletResource.insert(newWalletData);

			let userDetail = retrieveUserDetail(newUserId);
			resolve(userDetail);
		}
		return;
	});
}

async function sendEmailToResetPassword(user, userToken, email) {
	let link = `${process.env.LINK_WEB_SITE}/resetPassword?token=${userToken}`;
	let userType = "Người dùng";

	let emailResult = await EmailClient.sendEmail(
		email,
		`${process.env.SMTP_EMAIL} - Thông Báo Thay Đổi Mật Khẩu`,
		"ĐẶT LẠI MẬT KHẨU CỦA BẠN",
		`<div style="width: 100%; font-family: Arial, Helvetica, sans-serif;">
      <div style="display: flex; width: 100%; align-items: center; justify-content: center; justify-items: center;">
          <div style="width: 70%;">
              <p>Chào bạn <strong>${user.firstName}</strong></p>
              <div>Bạn đang yêu cầu thay đổi mật khẩu tài khoản <a style="color: blue;" href="${link}">${email}</a></div>
              <div>Loại tài khoản là <strong>${userType}</strong></div>
              <p>Để cấp lại mật khẩu, Vui lòng click vào đường dẫn dưới đây: <strong><a href="${link}" style="color: blue;">Link xác nhận khôi phục mật khẩu</a></strong></p>
              <br />
              <p>Mọi thắc mắc vui lòng liên hệ hòm email: <a href="">${process.env.SMTP_EMAIL}</a> để được hỗ trợ và giải đáp</p>
              <p>Chúc bạn có những trải nghiệm thú vị cùng <a href="${process.env.LINK_WEB_SITE}" style="text-decoration: none; cursor: pointer; color: cadetblue;">shofi.com.vn</a></p>
              <div>Trân trọng,</div>
              <div>Ban quản trị</div>
          </div>
      </div>
    </div>`,
		undefined,
	);
	return emailResult;
}

async function sendFeebackUser(data, email) {
	let emailResult = await EmailClient.sendEmail(
		email,
		`${process.env.SMTP_EMAIL} - Thông Báo phản hồi khách hàng ${data.firstName} ${data.email}`,
		"Phản hồi",
		`${data.content} ${data.phoneNumber}`,
		undefined,
	);
	return emailResult;
}

async function sendEmailToVerifyEmail(user, userToken, email) {
	let link = `${process.env.LINK_WEB_SITE}/verifyEmail?token=${userToken}`;
	let userType = "";
	if (user.userType === USER_TYPE.PERSONAL) {
		userType = "Cá nhân";
	} else {
		userType = "Môi giới";
	}
	let emailResult = await EmailClient.sendEmail(
		email,
		`${process.env.SMTP_EMAIL} - Xác Thực Email Của Bạn`,
		"XÁC THỰC EMAIL CỦA BẠN",
		`<div style="width: 100%; font-family: Arial, Helvetica, sans-serif;">
      <div style="display: flex; width: 100%; align-items: center; justify-content: center; justify-items: center;">
          <div style="width: 70%;">
              <p>Chào bạn <strong>${user.firstName}</strong></p>
              <div>Bạn đang yêu cầu xác thực email <a style="color: blue;" href="">${email}</a></div>
              <div>Loại tài khoản là <strong>${userType}</strong></div>
              <p>Để xác thực email, Vui lòng click vào đường dẫn dưới đây: <strong><a href="${link}" style="color: blue;">Link xác thực email</a></strong></p>
              <br />
              <p>Mọi thắc mắc vui lòng liên hệ hòm email: <a href="">${process.env.SMTP_EMAIL}</a> để được hỗ trợ và giải đáp</p>
              <p>Chúc bạn có những trải nghiệm thú vị cùng <a href="${process.env.LINK_WEB_SITE}" style="text-decoration: none; cursor: pointer; color: cadetblue;">fihome.com.vn</a></p>
              <div>Trân trọng,</div>
              <div>Ban quản trị</div>
          </div>
      </div>
    </div>`,
	);

	return emailResult;
}

function parseStringJson(stringJson) {
	try {
		return JSON.parse(stringJson);
	} catch (error) {
		return [];
	}
}

function currencyFormat(num, million, currencyMillion) {
	if (!num) {
		return "";
	}
	if (million) {
		const numberString = num.toString();
		if (numberString.length > 6) {
			return `${numberString.substring(0, numberString.length - 6)} ${currencyMillion}`;
		}
	}
	if (!num || isNaN(num)) {
		return num;
	}
	try {
		return num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	} catch (error) {
		return num;
	}
}

async function sendEmailBillToCustomer(data) {
	const {
		userId,
		address,
		cityCode,
		cityIndex,
		cityName,
		couponCode,
		districtCode,
		districtIndex,
		districtName,
		email,
		firstName,
		note,
		paymentMethod,
		phoneNumber,
		wardCode,
		wardIndex,
		wardName,
		listCart,
		status,
		totalSum,
		feeShip,
		couponPrice,
		totalPrice,
		totalAmount,
		orderCode,
		createdAt,
	} = data;
	const listCartArray = parseStringJson(listCart);
	const emailFeeback = "cuong.ho@ocmg.vn";
	let emailResult = await EmailClient.sendEmail(
		email,
		`Xác nhận đơn hàng #${orderCode} từ C&T Style`,
		"C&T Style",
		`<div style="font-family:&quot;Arial&quot;,Helvetica Neue,Helvetica,sans-serif;line-height:14pt;padding:20px 0px;font-size:14px;max-width:580px;margin:0 auto">
		<div class="adM"></div>
		<div style="padding:0 10px;margin-bottom:25px">
			<div class="adM"></div>
			<p>Xin chào ${firstName}</p>
			<p>Cảm ơn Anh/chị đã đặt hàng tại <strong>C&T Style</strong>! </p>
			<p>Đơn hàng của Anh/chị đã được tiếp nhận, chúng tôi sẽ nhanh chóng liên hệ với Anh/chị.</p>
		</div>
		<hr>
		<div style="padding:0 10px">
			<table style="width:100%;border-collapse:collapse;margin-top:20px">
			<thead>
				<tr>
				<th style="text-align:left;width:50%;font-size:medium;padding:5px 0">Thông tin mua hàng</th>
				<th style="text-align:left;width:50%;font-size:medium;padding:5px 0">Địa chỉ nhận hàng</th>
				</tr>
			</thead>
			<tbody>
				<tr>
				<td style="padding-right:15px">
					<table style="width:100%">
					<tbody>
						<tr>
						<td>test test</td>
						</tr>
						<tr>
						<td style="word-break:break-word;word-wrap:break-word">
							<a href="mailto:${email}" target="_blank">${email}</a>
						</td>
						</tr>
						<tr>
						<td>${phoneNumber}</td>
						</tr>
					</tbody>
					</table>
				</td>
				<td>
					<table style="width:100%">
					<tbody>
						<tr>
						<td>${address}</td>
						</tr>
						
						<tr>
						<td style="word-break:break-word;word-wrap:break-word"> Phường ${wardName}, Quận ${districtName}, ${cityName} </td>
						</tr>
						<tr>
						<td>${phoneNumber}</td>
						</tr>
					</tbody>
					</table>
				</td>
				</tr>
			</tbody>
			</table>
			<table style="width:100%;border-collapse:collapse;margin-top:20px">
			<thead>
				<tr>
				<th style="text-align:left;width:50%;font-size:medium;padding:5px 0">Phương thức thanh toán</th>
				<th style="text-align:left;width:50%;font-size:medium;padding:5px 0">Phương thức vận chuyển</th>
				</tr>
			</thead>
			<tbody>
				<tr>
				<td style="padding-right:15px">Thanh toán khi giao hàng (COD)</td>
				<td> Giao hàng tận nơi <br>
				</td>
				</tr>
			</tbody>
			</table>
		</div>
		<div style="margin-top:20px;padding:0 10px">
			<div style="padding-top:10px;font-size:medium">
			<strong>Thông tin đơn hàng</strong>
			</div>
			<table style="width:100%;margin:10px 0">
			<tbody>
				<tr>
				<td style="width:50%;padding-right:15px">Mã đơn hàng: ${orderCode}</td>
				<td style="width:50%">Ngày đặt hàng: ${moment(createdAt).format("DD/MM/YYYY")}</td>
				</tr>
			</tbody>
			</table>
			<ul style="padding-left:0;list-style-type:none;margin-bottom:0">
			${listCartArray.map(
				(item) => `	<li>
				<table style="width:100%;border-bottom:1px solid #e4e9eb">
				<tbody>
					<tr>
					<td style="width:100%;padding:25px 10px 0px 0" colspan="2">
						<div style="float:left;width:80px;height:80px;border:1px solid #ebeff2;overflow:hidden">
						<img style="max-width:100%;max-height:100%" src="${item.Products.productsAvatarThumbnails}"
																	alt="${item.Products.productsTitle}" class="CToWUd" data-bit="iit">
						</div>
						<div style="margin-left:100px">
						<a href="${process.env.LINK_WEB_SITE}/collections/san-pham/${
					item.Products.slug
				}" style="color:#357ebd;text-decoration:none" target="_blank" data-saferedirecturl="${
					process.env.LINK_WEB_SITE
				}/collections/san-pham/${item.Products.slug}">${item.Products.productsTitle}</a>
						<p style="color:#678299;margin-bottom:0;margin-top:8px">${item?.Color?.name || "Mặc định"}  </p>
						<p style="color:#678299;margin-bottom:0;margin-top:8px">${
							item.Products.sizeSelectSlug ? `${item.Products.sizeSelectSlug}` : ""
						}</p>
						</div>
					</td>
					</tr>
					<tr>
					<td style="width:70%;padding:5px 0px 25px">
						<div style="margin-left:100px"> ${currencyFormat(
							+item.Products.realPrice,
							0,
							0,
						)} VND <span style="margin-left:20px">x ${item.Products.amount}</span>
						</div>
					</td>
					<td style="text-align:right;width:30%;padding:5px 0px 25px"> ${currencyFormat(
						+(item.Products.realPrice * item.Products.amount),
						0,
						0,
					)} VND</td>
					</tr>
				</tbody>
				</table>
			</li>`,
			)}
		
			
			</ul>
			<table style="width:100%;border-collapse:collapse;margin-bottom:50px;margin-top:10px">
			<tbody>
				<tr>
				<td style="width:20%"></td>
				<td style="width:80%">
					<table style="width:100%;float:right">
					<tbody>
						<tr>
						<td style="padding-bottom:10px">Tạm tính:</td>
						<td style="font-weight:bold;text-align:right;padding-bottom:10px"> ${currencyFormat(
							+totalPrice,
							0,
							0,
						)} VND</td>
						</tr>
						<tr>
						${
							couponPrice && couponPrice !== "" && couponPrice !== "0"
								? `
							<td style="padding-bottom:10px">Giá trừ khuyến mãi:</td>
						<td style="font-weight:bold;text-align:right;padding-bottom:10px">- ${
							currencyFormat(+couponPrice, 0, 0) || 0
						} VND</td>
						</tr>`
								: null
						}
						${
							feeShip && feeShip !== ""
								? `
						<tr>
						<td style="padding-bottom:10px">Phí vận chuyển:</td>
						<td style="font-weight:bold;text-align:right;padding-bottom:10px"> ${currencyFormat(
							+feeShip,
							0,
							0,
						)} VND</td>
						</tr>`
								: null
						}
						<tr style="border-top:1px solid #e5e9ec">
						<td style="padding-top:10px">Thành tiền</td>
						<td style="font-weight:bold;text-align:right;font-size:16px;padding-top:10px">  ${currencyFormat(
							+totalSum,
							0,
							0,
						)} VND</td>
						</tr>
					</tbody>
					</table>
				</td>
				</tr>
			</tbody>
			</table>
		</div>
		<div style="clear:both"></div>
		<div style="padding:0 10px">
			<p style="margin:30px 0">
			<span style="font-weight:bold">Ghi chú:</span>
			<span>${note}</span>
			</p>
		</div>
		<div style="clear:both"></div>
		<div style="padding:0 10px">
			<p style="height:50px">
			<span style="float:left;margin-top:14px;margin-right:10px">Để kiểm tra trạng thái đơn hàng, Anh/chị vui lòng:</span>
			<span style="margin-top:25px;float:left">
				<span style="padding:14px 35px;background:#357ebd">
				<a href="${
					process.env.LINK_WEB_SITE
				}/account/login" style="font-size:16px;text-decoration:none;color:#fff" target="_blank" data-saferedirecturl=${
			process.env.LINK_WEB_SITE
		}>Đăng nhập vào tài khoản</a>
				</span>
			</span>
			</p>
			<div style="clear:both"></div>
			<p style="margin:30px 0">Nếu Anh/chị có bất kỳ câu hỏi nào, xin liên hệ với chúng tôi tại <a href="mailto:${emailFeeback}" style="color:#357ebd" target="_blank">${emailFeeback}</a>
			</p>
			<p style="text-align:right">
			<i>Trân trọng,</i>
			</p>
			<p style="text-align:right">
			<strong>Ban quản trị cửa hàng C&T Style</strong>
			</p>
		</div>
	</div>`,
	);

	return emailResult;
}
module.exports = {
	sendEmailBillToCustomer,
	verifyUniqueUser,
	verifyUserCredentials,
	hashPassword,
	unhashPassword,
	retrieveUserDetail,
	changeUserPassword,
	changeUserSecondaryPassword,
	generate2FACode,
	verify2FACode,
	createNewUser,
	sendEmailToResetPassword,
	sendEmailToVerifyEmail,
	verifyUserSecondaryPassword,
	getUnreadNotificationCount,
	sendFeebackUser,
};
