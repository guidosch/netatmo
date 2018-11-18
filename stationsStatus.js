var auth = require('./myNetatmoAuth.js');
var netatmo = require('netatmo');
var devices = require('./devices.js');
var api = new netatmo(auth());

var result = {};
module.exports = {
    checkStationsData: function (response) {

        api.getStationsData(devices.optionsMainStation, function (err, stationsData) {
            /**
            measure object looks like this:
            { beg_time: 1452028500, value: [ [ 21.7, 1532, 61 ] ] }
            **/
            //result.temperatureMain = measure[0].value[0][0];
            //result.co2Main = measure[0].value[0][1];
            //result.humidityMain = measure[0].value[0][2];
            response.end(JSON.stringify(stationsData));
            console.log(JSON.stringify("result from getStationsData: "+stationsData));
        });
    }
}




