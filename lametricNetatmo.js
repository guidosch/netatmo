var result = {
	icon_type: "none",
	model: {
		frames: [],
		cycles: 2
	},
};

var optionsLametric = {
	hostname: '192.168.2.32',
	port: "8080",
	path: '/api/v2/device/notifications',
	method: 'POST',
	auth: "dev:a06055aec93a298ea3672c7d81ba7d2b4fa14933654a245831d335233c43e00f",
	headers: {
		'Content-Type': 'application/json',
		'Content-Length': 0
	}
};
module.exports = {
	optionsLametric: optionsLametric,
	createLametricFormat : function (measurments) {
		result.model.frames = [];
		result.model.frames.push({ "icon": "i2355", "text": measurments.temperatureMain + "°C In" });
		result.model.frames.push({ "icon": "i12785", "text": measurments.co2Main });
		result.model.frames.push({ "icon": "i3359", "text": measurments.humidityMain + "%" });
		return JSON.stringify(result);
	}
};