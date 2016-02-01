var http = require('http');
var moment = require('moment');

module.exports = {
	checkApi: function(response) {

		var status = {
			apiAvailableStatus: false,
			apiDataUptoDate: false
		};

		http.get('http://data.netcetera.com/smn/smn/SMA', (res) => {
			console.log(`Got response: ${res.statusCode}`);

			if (res.OK) {
				status.apiAvailableStatus = true;
			}

			var responseObj;

			res.on('data', (data) => {
				console.log(`Got data: ${data}`);
				responseObj = JSON.parse(data);
			});

			

			res.on('end', () => {
				console.log("response end event...");
				if (res.OK) {
					var repsonseDate = moment(responseObj.dateTime);
					console.log(repsonseDate);
					status.apiDataUptoDate = true;
				}
				response.end(JSON.stringify(status));
			})

			//res.resume();

		}).on('error', (e) => {
			console.log(`Got error: ${e.message}`);
			response.end(JSON.stringify(status));
		});
	}
}