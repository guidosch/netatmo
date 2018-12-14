
const https = require("https");

//zürich
const cityId = 2657896;
//api key für guido.schnider@gmail.com from openweathermap.org
const apiKey = "16b9e0f9dfb60ed51feb4a2cc3dbbd58";

module.exports = {
    forecast: function (response) {
        let result = {};
        result.sunshine = false;

        https.get("https://api.openweathermap.org/data/2.5/forecast?id=" + cityId + "&appid=" + apiKey, (resp) => {
            let data = "";

            // A chunk of data has been recieved.
            resp.on("data", (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on("end", () => {
                let weather = JSON.parse(data);
                if (weather.cnt > 2) {
                    result.sunshine = false;
                    //the sun shines only on daytime --> "d"
                    if (weather.list[0].sys.pod === "d") {
                        for (let i = 0; i < 2; i++) {
                            let weatherId = weather.list[i].weather.id;
                            //weather cond. ids: https://openweathermap.org/weather-conditions
                            if (weatherId >= 800 && weatherId < 803) {
                                result.sunshine = true;
                            } else {
                                result.sunshine = false;
                            }
                        }
                    }
                }
                response.end(JSON.stringify(result));
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            response.end(JSON.stringify(result));
        });
    }
};




