const auth = require("./myParticleAuth.js");
const https = require("https");
const Particle = require("particle-api-js");
const particle = new Particle();
let particle_auth_token;
const particle_username = auth.username();
const particle_password = auth.password();
const particleEventName = "hasUnusedSolarPower";

// solaredge config
const API_KEY = "45NEMUJWP3HU7TATDEGN7LLUO4FL2HJI"; //see 1password for user
const SITE = 2801781;

const requestOptions = {
    host: "monitoringapi.solaredge.com",
    port: 443,
    path: `/site/${SITE}/currentPowerFlow?api_key=${API_KEY}`,
    headers: {
        "Cache-Control": "max-age=0"
    }
};

function sendToParticle(particleData) {
    let _particleData = particleData;
    particle.login({ username: particle_username, password: particle_password }).then(
        function (data) {
            particle_auth_token = data.body.access_token;
            var publishEventPr = particle.publishEvent({
                name: particleEventName, data: _particleData, auth: particle_auth_token
            });

            publishEventPr.then(
                function (data) {
                    if (data.body.ok) { console.log("Event: published succesfully"); }
                },
                function (err) {
                    console.log("Failed to publish event:" + err);
                }
            );

        },
        function (err) {
            console.log("Could not log in.", err);
        }
    );
}



function hasUnusedSolasPower(data) {
    console.log(JSON.stringify(data));
    let connections = data.siteCurrentPowerFlow.connections;
    if (data.siteCurrentPowerFlow.PV.status.match(/active/i)) {
        let powerCount = 0;
        connections.forEach(connection => {
            if (connection.from.match(/pv/i) && connection.to.match(/load/i)) {
                console.log("power count ++");
                powerCount++;
            }
            if (connection.from.match(/load/i) && connection.to.match(/grid/i)) {
                console.log("power count ++");
                powerCount++;
            }
            if (powerCount == 2) {
                return true;
            }
        });
    }
    return false;
}

module.exports = {
    solarPowerDataForParticle: function () {

        https.get(requestOptions, (res) => {
            var responseObj;
            res.on("data", (data) => {
                console.log(`Got data: ${data}`);
                responseObj = JSON.parse(data);
            });

            res.on("end", () => {
                if (res.statusCode == 200) {
                    sendToParticle(JSON.stringify(hasUnusedSolasPower(responseObj)));
                }
            });

        }).on("error", (e) => {
            console.log(`Got error: ${e.message}`);
        });

    },
}; 
