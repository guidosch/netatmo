var auth = require("./myNetatmoAuth.js");
var netatmo = require("netatmo");
var http = require("http");
var dispatch = require("dispatch");
var schedule = require("node-schedule");
var apistatus = require("./meteoDataAPIStatus.js");
var lametricNetatmo = require("./lametricNetatmo.js");
var devices = require("./devices.js");
var util = require("./util.js");
var stationsStatus = require("./stationsStatus.js");
var openweathermap = require("./openweathermap.js");

const PORT = 8000;
const HEADERS = util.HEADERS;
var api = new netatmo(auth());
//result object from netatmo devices and meteo api in one object
var result = {};


function readFromNetatmoAPI() {
    api.getMeasure(devices.optionsMainStation, function (err, measure) {
        /**
        measure object looks like this:
        { beg_time: 1452028500, value: [ [ 21.7, 1532, 61 ] ] }
        **/

        var debug = JSON.stringify(measure);
        //console.log(debug);

        if (Array.isArray(measure) && Array.isArray(measure[0].value)) {
            result.temperatureMain = measure[0].value[0][0];
            result.co2Main = measure[0].value[0][1];
            var value = measure[0].value[0][2];
            result.humidityMain = parseInt(value) - 5; //main humidity is 5% too high
            result.lastUpdateSecondsAgo = Math.round(Date.now() / 1000) - (measure[0].beg_time);
        } else {
            console.log("Error reading from main netatmo module: "+JSON.stringify(measure));
        }
    });
    api.getMeasure(devices.optionsModuleRoom, function (err, measure) {
        /**
        measure object looks like this:
        { beg_time: 1452028500, value: [ [ 21.7, 1532, 61 ] ] }
        **/
        if (Array.isArray(measure) && Array.isArray(measure[0].value)) {
            result.temperatureRoom = measure[0].value[0][0];
            result.co2Room = measure[0].value[0][1];
            result.humidityRoom = measure[0].value[0][2];
        } else {
            console.log("Error reading from room netatmo module: "+JSON.stringify(measure));
        }
    });
    api.getMeasure(devices.optionsModuleOutside, function (err, measure) {
        /**
        measure object looks like this:
        { beg_time: 1452028500, value: [ [ 21.7, 1532, 61 ] ] }
        **/
        if (Array.isArray(measure) && Array.isArray(measure[0].value)) {
            result.temperatureOutside = measure[0].value[0][0];
            result.humidityOutside = measure[0].value[0][1];
        } else {
            console.log("Error reading from outdoor netatmo module: "+JSON.stringify(measure));
        }
    });
    console.log(new Date());
    console.log(JSON.stringify(result));
}

schedule.scheduleJob("59 * * * * *", function () {
    readFromNetatmoAPI();
});

//send netatmo data to lametric 
schedule.scheduleJob("30 * * * * *", function () {

    var data = lametricNetatmo.createLametricFormat(result);
    console.log("netatmo for lametric: " + data);
    lametricNetatmo.optionsLametric.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
    const req = http.request(lametricNetatmo.optionsLametric, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
            console.log(`response from netatmo to lametric req.: ${chunk}`);
        });
        res.on("end", () => {
            console.log("No more data in response.");
        });
    });

    req.on("error", (e) => {
        console.log(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(data);
    req.end();
});

//send sma station opendata to lametric
schedule.scheduleJob("40 * * * * *", function () {
    apistatus.meteoDataForLametric(lametricNetatmo.optionsLametric);
});

schedule.scheduleJob("*/5 * * * *", function () {
    apistatus.meteoDataForParticle();
});

//todo get data from raspi, and display in loxone webpage, ev. auch was mit counter und time??? machen wie watchdog oder so
var server = http.createServer(
    dispatch({
        "/netatmo": function (request, response) {
            response.writeHead(200, HEADERS);
            response.end(JSON.stringify(result));
        },
        "/test": function (request, response) {
            response.writeHead(200, HEADERS);
            response.end("{testNull: null,testNullString: 'null',overflow: -9999}");
        },
        "/apistatus": function (request, response) {
            response.writeHead(200, HEADERS);
            apistatus.checkApi(response);
        },
        "/stationsdata": function (request, response) {
            response.writeHead(200, HEADERS);
            stationsStatus.checkStationsData(response);
        },
        "/sunshinenext6hours": function (request, response) {
            response.writeHead(200, HEADERS);
            openweathermap.sunshineForecast(response);
        },
        "/thunderstormwarning": function (request, response) {
            response.writeHead(200, HEADERS);
            openweathermap.thunderstormForecast(response);
        }

    }));

server.listen(PORT, function () {
    console.log("Server listening on: http://localhost:%s", PORT);
});

//initialize data
readFromNetatmoAPI();

