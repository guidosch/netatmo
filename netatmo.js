var auth = require('./myNetatmoAuth.js');
var netatmo = require('netatmo');
var http = require('http');
var dispatch = require('dispatch');
var apistatus = require('./meteoDataAPIStatus.js');

const PORT = 8000;
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}

var api = new netatmo(auth());


// Get Devicelist 
// See docs: http://dev.netatmo.com/doc/restapi/devicelist 
api.getDevicelist(function(err, devices, modules) {
  //console.log(devices);
  //console.log(modules);
});

// Get Measure 
// See docs: http://dev.netatmo.com/doc/restapi/getmeasure 
var options = {
  device_id: '70:ee:50:01:97:20',
  scale: '30min',
  type: ['Temperature', 'CO2', 'Humidity'],
  date_end: 'last',
  optimize: true
};

var result = {};

api.getMeasure(options, function(err, measure) {

  /**
  measure object looks like this:
  { beg_time: 1452028500, value: [ [ 21.7, 1532, 61 ] ] }
  **/
  result.temperature = measure[0].value[0][0];
  result.co2 = measure[0].value[0][1];
  result.humidity = measure[0].value[0][2];

});

function handleRequest(request, response) {

  api.getMeasure(options, function(err, measure) {

    /**
    measure object looks like this:
    { beg_time: 1452028500, value: [ [ 21.7, 1532, 61 ] ] }
    **/
    result.temperature = measure[0].value[0][0];
    result.co2 = measure[0].value[0][1];
    result.humidity = measure[0].value[0][2];

  });

  response.writeHead(200, HEADERS);
  response.end(JSON.stringify(result));
}

//todo get data from raspi, and display in loxone webpage, ev. auch was mit counter und time??? machen wie watchdog oder so

var server = http.createServer(
  dispatch({
    '/netatmo': function(request, response){
      handleRequest(request, response);
    },
    '/test': function(request, response){
      response.writeHead(200, HEADERS);
      response.end("{testNull: null,testNullString: 'null',overflow: -9999}");
    },
    '/apistatus': function(request, response){
      response.writeHead(200, HEADERS);
      apistatus.checkApi(response);
    },

  }));

server.listen(PORT, function() {
  console.log("Server listening on: http://localhost:%s", PORT);
});