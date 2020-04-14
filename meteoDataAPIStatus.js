var auth = require("./myParticleAuth.js");
var http = require("http");
var moment = require("moment");
var Particle = require("particle-api-js");
var particle = new Particle();
var particle_auth_token;
var particle_username = auth.username();
var particle_password = auth.password();

var MAX_DATA_AGE = 25 * 60 * 1000;

var requestOptions = {
    host: "192.168.2.40",
    port: 4712,
    path: "/smn/SMA",
    headers: {
        "Cache-Control": "max-age=0"
    }
};

function sendToLametric(data, options) {
    options.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
    const req = http.request(options, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
            console.log(`BODY: ${chunk}`);
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
}

function sendToParticle(particleData) {
    var _particleData = particleData;
    particle.login({ username: particle_username, password: particle_password }).then(
        function (data) {
            particle_auth_token = data.body.access_token;
            console.log("particle event: " + _particleData);
            var publishEventPr = particle.publishEvent({
                name: "meteodata", data: _particleData, auth: particle_auth_token
            });

            publishEventPr.then(
                function (data) {
                    if (data.body.ok) { console.log("Event published succesfully"); }
                },
                function (err) {
                    console.log("Failed to publish event: " + err);
                }
            );

        },
        function (err) {
            console.log("Could not log in.", err);
        }
    );
}

module.exports = {
    checkApi: function (response) {

        var status = {
            apiAvailableStatusAsBoolean: false,
            apiDataUptoDateAsBoolean: false,
            apiAvailableStatus: 0,
            apiDataUptoDate: 0,
            apiDataAgeInMinutes: 0
        };

        http.get(requestOptions, (res) => {
            console.log(`Got response: ${res.statusCode}`);

            if (res.statusCode == 200) {
                status.apiAvailableStatusAsBoolean = true;
                status.apiAvailableStatus = 1;
            }

            var responseObj;

            res.on("data", (data) => {
                console.log(`Got data: ${data}`);
                responseObj = JSON.parse(data);
            });

            res.on("end", () => {
                console.log("response end event...");
                if (res.statusCode == 200) {
                    var repsonseDate = moment(responseObj.dateTime);
                    var diff = moment().diff(repsonseDate);
                    if (diff < MAX_DATA_AGE) {
                        status.apiDataUptoDateAsBoolean = true;
                        status.apiDataUptoDate = 1;
                        console.log("Data is up to date...");
                    }
                    status.apiDataAgeInMinutes = Math.round(diff / 1000 / 60);

                }
                response.end(JSON.stringify(status));
            });

        }).on("error", (e) => {
            console.log(`Got error: ${e.message}`);
            response.end(JSON.stringify(status));
        });
    },
    meteoDataForLametric: function (options) {

        var result = {
            icon_type: "none",
            model: {
                frames: [],
                cycles: 2
            },
        };

        http.get(requestOptions, (res) => {
            var responseObj;
            res.on("data", (data) => {
                console.log(`Got data: ${data}`);
                responseObj = JSON.parse(data);
            });

            res.on("end", () => {
                if (res.statusCode == 200) {
                    result.model.frames.push({ "icon": "i2355", "text": responseObj.temperature + "°C Out" });
                    var rain = parseFloat(responseObj.precipitation);
                    //todo convert double to light rain, heavy rain...
                    if (rain > 0) {
                        result.model.frames.push({ "icon": "i2416", "text": rain + "mm" });
                    }
                    result.model.frames.push({ "icon": "i9095", "text": responseObj.windSpeed + "/" + responseObj.gustPeak + "km/h" });
                    sendToLametric(JSON.stringify(result), options);
                }
            });

        }).on("error", (e) => {
            console.log(`Got error: ${e.message}`);
        });

    },

    meteoDataForParticle: function () {

        var result = {
            sunshine: 0,
            gustPeak: 0,
            outsidetemperature: 0,
            outsidehumidity: 0,
            precipitation: 0,
            status: "ok"
        };

        http.get(requestOptions, (res) => {
            var responseObj;
            res.on("data", (data) => {
                console.log(`Got data: ${data}`);
                responseObj = JSON.parse(data);
            });

            res.on("end", () => {
                if (res.statusCode == 200) {

                    result.sunshine = responseObj.sunshine;
                    result.gustPeak = responseObj.gustPeak;
                    result.outsidetemperature = responseObj.temperature;
                    result.outsidehumidity = responseObj.humidity;
                    result.precipitation = responseObj.precipitation;

                    sendToParticle(JSON.stringify(result));
                }
            });

        }).on("error", (e) => {
            console.log(`Got error: ${e.message}`);
        });

    },
}; 
