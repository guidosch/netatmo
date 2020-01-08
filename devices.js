var optionsMainStation = {
    //main station
    device_id: "70:ee:50:01:97:20",
    scale: "max",
    type: ["Temperature", "CO2", "Humidity"],
    date_end: "last",
    optimize: true
};

var optionsModuleRoom = {
    //room module
    x: "room",
    device_id: "70:ee:50:01:97:20",
    module_id: "03:00:00:06:37:cc",
    scale: "max",
    type: ["Temperature", "CO2", "Humidity"],
    date_end: "last",
    optimize: true
};

var optionsModuleOutside = {
    //outside module
    x: "outside",
    device_id: "70:ee:50:01:97:20",
    module_id: "02:00:00:01:94:24",
    scale: "max",
    type: ["Temperature", "Humidity"],
    date_end: "last",
    optimize: true
};

module.exports = {
    optionsMainStation: optionsMainStation,
    optionsModuleRoom: optionsModuleRoom,
    optionsModuleOutside: optionsModuleOutside
};