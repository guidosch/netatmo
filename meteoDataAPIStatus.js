var http = require('http');
var moment = require('moment');
var MAX_DATA_AGE = 25*60*1000;
var requestOptions = {
	hostname: "data.netcetera.com",
	path: "/smn/smn/SMA",
	headers: {
		"Cache-Control":"max-age=0"
	}
}

module.exports = {
	checkApi: function(response) {

		var status = {
			apiAvailableStatus: false,
			apiDataUptoDate: false,
			apiDataAgeInMinutes: 0
		};

		http.get(requestOptions, (res) => {
			console.log(`Got response: ${res.statusCode}`);

			if (res.statusCode == 200) {
				status.apiAvailableStatus = true;
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
						status.apiDataUptoDate = true;
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
	}
}