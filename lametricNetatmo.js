var result = {
			icon_type = "none",
			model = {
				frames = ["cycles":2]
			},
		};

module.exports = {
	createLametricFormat: function(measure) {
		//indoor temp
		result.model.frames.push({"icon":"i2355"+measure[0].value[0][0]+"°C In"});
		//co2
		result.model.frames.push({"icon":"i12785"+measure[0].value[0][1]+"CO2"});
		//humidity
		result.model.frames.push({"icon":"i3359"+measure[0].value[0][2]+"%"});
		return JSON.stringify(result);
	}
};