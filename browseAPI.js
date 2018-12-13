var auth = require("./myNetatmoAuth.js");
var netatmo = require("netatmo");


var api = new netatmo(auth());

// Get Devicelist 
// See docs: http://dev.netatmo.com/doc/restapi/devicelist 
api.getDevicelist(function (err, devices, modules) {
    //console.log(devices);
    //console.log(modules);
    modules.forEach(element => {
        //only list my modules
        if (element.main_device === "70:ee:50:01:97:20") {
            //console.log(element);
        }
    });
});

// Get Measure 
// See docs: http://dev.netatmo.com/doc/restapi/getmeasure 
var optionsMainStation = {
    //main station
    device_id: "70:ee:50:01:97:20",
    scale: "30min",
    type: ["Temperature", "CO2", "Humidity"],
    date_end: "last",
    optimize: true
};

var optionsModuleRoom = {
    //room module
    x: "room",
    device_id: "70:ee:50:01:97:20",
    module_id: "03:00:00:06:37:cc",
    scale: "30min",
    type: ["Temperature", "CO2", "Humidity"],
    date_end: "last",
    optimize: true
};

var optionsModuleOutside = {
    //outside module
    x: "outside",
    device_id: "70:ee:50:01:97:20",
    module_id: "02:00:00:01:94:24",
    scale: "30min",
    type: ["Temperature", "Humidity"],
    date_end: "last",
    optimize: true
};


api.getMeasure(optionsMainStation, function (err, measure) {
    console.log(optionsMainStation.x);
    console.log(JSON.stringify(err));
    console.log(JSON.stringify(measure));

});

api.getMeasure(optionsModuleOutside, function (err, measure) {
    console.log(optionsModuleOutside.x);
    console.log(JSON.stringify(err));
    console.log(JSON.stringify(measure));

});

api.getMeasure(optionsModuleRoom, function (err, measure) {
    console.log(optionsModuleRoom.x);
    console.log(JSON.stringify(err));
    console.log(JSON.stringify(measure));
    process.exit();
});



