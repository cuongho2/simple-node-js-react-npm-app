const SystemConfigurations = require("./SystemConfigurationsRoute");

module.exports = [
	//System configuration APIs
	{ method: "POST", path: "/SystemConfigurations/getList", config: SystemConfigurations.getList },
	{
		method: "POST",
		path: "/SystemConfigurations/updateConfigs",
		config: SystemConfigurations.updateConfigs,
	},
	{
		method: "POST",
		path: "/SystemConfigurations/user/getDetail",
		config: SystemConfigurations.userGetDetail,
	},
];
