const auth = require("./myNetatmoAuth.js");
const netatmo = require("netatmo");
const devices = require("./devices.js");
const api = new netatmo(auth());

const result = {};
module.exports = {
    checkStationsData: function (response) {

        api.getStationsData(devices.optionsMainStation, function (err, stationsData) {
            const mainModuleName = stationsData[0].module_name;
            const mainOnline = stationsData[0].reachable;
            result.mainOnline = mainOnline;

            if (mainOnline && mainModuleName === "Wohnzimmer") {
                //module 1 --> outdoor
                result.module1 = stationsData[0].modules[0].module_name;
                result.module1Online = stationsData[0].modules[0].reachable;
                //module 2 --> zimmer
                result.module2 = stationsData[0].modules[1].module_name;
                result.module2Online = stationsData[0].modules[1].reachable;
            }
            //console.log(JSON.stringify(result));
            response.end(JSON.stringify(result));
        });
    }
};




