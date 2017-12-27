var http = require('http');
var http = require('https');
var moment = require('moment');
var MAX_DATA_AGE = 25*60*1000;
var requestOptions = {
	hostname: "opendata.netcetera.com",
	path: "/smn/smn/SMA",
	headers: {
		"Cache-Control":"max-age=0"
	}
}

function sendToLametric(data, options){
	const req = http.request(options, (res) => {
	  res.setEncoding('utf8');
	  res.on('data', (chunk) => {
	    console.log(`BODY: ${chunk}`);
	  });
	  res.on('end', () => {
	    console.log('No more data in response.');
	  });
	});

	req.on('error', (e) => {
	  console.log(`problem with request: ${e.message}`);
	});

	// write data to request body
	req.write(data);
	req.end();
}

module.exports = {
	checkApi: function(response) {

		var status = {
			apiAvailableStatusAsBoolean: false,
			apiDataUptoDateAsBoolean: false,
			apiAvailableStatus: 0,
			apiDataUptoDate: 0,
			apiDataAgeInMinutes: 0
		};

		https.get(requestOptions, (res) => {
			console.log(`Got response: ${res.statusCode}`);

			if (res.statusCode == 200) {
				status.apiAvailableStatusAsBoolean = true;
				status.apiAvailableStatus = 1;
			}

			var responseObj;

			res.on('data', (data) => {
				console.log(`Got data: ${data}`);
				responseObj = JSON.parse(data);
			});

			res.on('end', () => {
				console.log("response end event...");
				if (res.statusCode == 200) {
					var repsonseDate = moment(responseObj.dateTime);
					var diff = moment().diff(repsonseDate);
					if (diff < MAX_DATA_AGE){
						status.apiDataUptoDateAsBoolean = true;
						status.apiDataUptoDate = 1;
						console.log("Data is up to date...");
					}
					status.apiDataAgeInMinutes = Math.round(diff/1000/60);
					
				}
				response.end(JSON.stringify(status));
			})

		}).on('error', (e) => {
			console.log(`Got error: ${e.message}`);
			response.end(JSON.stringify(status));
		});
	},
	meteoDataForLametric: function(options) {

		var result = {
			icon_type : "none",
			model : {
				frames : [],
				cycles : 2
			},
		};

		https.get(requestOptions, (res) => {
			var responseObj;
			res.on('data', (data) => {
				console.log(`Got data: ${data}`);
				responseObj = JSON.parse(data);
			});

			res.on('end', () => {
				console.log("response end event...");
				if (res.statusCode == 200) {
					result.model.frames.push({"icon":"i2355", "text":responseObj.temperature+" °C Out"});
					var rain = parseFloat(responseObj.precipitation);
					if (rain > 0.1){
						result.model.frames.push({"icon":"i2416","text": rain+" mm"});
					}
					result.model.frames.push({"icon":"i9095","text":responseObj.windSpeed+"/"+responseObj.gustPeak+" km/h"});
					sendToLametric(JSON.stringify(result), options);
				}
			})

		}).on('error', (e) => {
			console.log(`Got error: ${e.message}`);
		});

	}
} 
