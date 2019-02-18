
const https = require("https");
const auth = require("./myNetatmoAuth.js");

//zürich
const cityId = 2657896;
//api key für guido.schnider@gmail.com from openweathermap.org
const apiKey = auth().apiKeyOpenweathermap;

module.exports = {
    sunshineForecast: function (response) {
        const result = {};
        result.sunshine = 0;
        result.type = "sun";
        doRequest(response, result);
    },
    thunderstormForecast: function (response) {
        const result = {};
        result.thunderstorm = 0;
        result.type = "thunderstorm";
        doRequest(response, result);
    }

};

function doRequest(response, result) {

    https.get("https://api.openweathermap.org/data/2.5/forecast?id=" + cityId + "&appid=" + apiKey, (resp) => {
        var data = "";
        // A chunk of data has been recieved.
        resp.on("data", (chunk) => {
            data += chunk;
        });
        resp.on("end", () => {
            const weather = JSON.parse(data);
            var weatherId = 0;
            switch (result.type) {
                case "sun":
                    result.sunshine = 0;
                    if (weather.cnt > 2) { //number of lines returned
                        //the sun shines only on daytime --> "d"
                        const hours3 = weather.list[0].sys.pod === "d";
                        const hours6 = weather.list[1].sys.pod === "d";
                        if (hours3 || hours6) {
                            for (var i = 0; i < 2; i++) {
                                weatherId = weather.list[i].weather[0].id;
                                //weather cond. ids: https://openweathermap.org/weather-conditions
                                if (weatherId >= 800 && weatherId < 803) {
                                    result.sunshine = 1;
                                }
                            }
                        }
                    }
                    response.end(JSON.stringify(result));
                    break;

                case "thunderstorm":
                    result.thunderstorm = 0;
                    if (weather.cnt > 1) {
                        weatherId = weather.list[0].weather[0].id;
                        //weather cond. ids: https://openweathermap.org/weather-conditions
                        if (weatherId >= 200 && weatherId < 232) {
                            result.thunderstorm = 1;
                        }
                    }
                    response.end(JSON.stringify(result));
                    break;
                default:
                    result.type = "error";
                    response.end(JSON.stringify(result));
                    break;
            }

        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
        response.end(JSON.stringify(result));
    });
}

