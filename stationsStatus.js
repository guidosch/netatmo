const auth = require("./myNetatmoAuth.js");
//const netatmo = require("netatmo");
const devices = require("./devices.js");
//const api = new netatmo(auth());
/**
 * loxone does not like true/false as http order so converting to 1 / 0 is needed
 * true * 1; // 1
 * false * 1; // 0
 */

const result = {};
result.mainModuleName = "room";
result.mainOnline = 1;

result.module1 = "zimmer1";
result.module1Online = 1;

result.module2 = "zimmer2";
result.module2Online = 1;


module.exports = {
    checkStationsData: function (response) {

        /**
        api.getStationsData(devices.optionsMainStation, function (err, stationsData) {
            const mainModuleName = stationsData[0].module_name;
            result.mainModuleName = mainModuleName;
            const mainOnline = stationsData[0].reachable * 1;
            result.mainOnline = mainOnline;

            if (mainOnline && mainModuleName === "Wohnzimmer") {
                //module 1 --> outdoor
                result.module1 = stationsData[0].modules[0].module_name;
                result.module1Online = stationsData[0].modules[0].reachable * 1;
                //module 2 --> zimmer
                result.module2 = stationsData[0].modules[1].module_name;
                result.module2Online = stationsData[0].modules[1].reachable * 1;
            }
            //console.log(JSON.stringify(result));
            response.end(JSON.stringify(result));
        });
         */
        response.end(JSON.stringify(result));
    }
};




