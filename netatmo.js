var auth = require('./myNetatmoAuth.js');
var netatmo = require('netatmo');
var http = require('http');
var dispatch = require('dispatch');
var schedule = require('node-schedule');
var apistatus = require('./meteoDataAPIStatus.js');
var lametricNetatmo = require('./lametricNetatmo.js');

const PORT = 8000;
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}

var api = new netatmo(auth());
var result = {};

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

var optionsLametric = {
  hostname: '192.168.2.32',
  port: "8080",
  path: '/api/v2/device/notifications',
  method: 'POST',
  auth: "dev:a06055aec93a298ea3672c7d81ba7d2b4fa14933654a245831d335233c43e00f",
  headers: {
    'Content-Type': 'application/json',
    'Content-Length' : 0
  }
};


function handleRequest(request, response) {

  api.getMeasure(options, function(err, measure) {
    /**
    measure object looks like this:
    { beg_time: 1452028500, value: [ [ 21.7, 1532, 61 ] ] }
    **/
    result = {};
    result.temperature = measure[0].value[0][0];
    result.co2 = measure[0].value[0][1];
    result.humidity = measure[0].value[0][2];
    response.writeHead(200, HEADERS);
    response.end(JSON.stringify(result));

  });
  
}

//send netatmo data to lametric 
var j = schedule.scheduleJob('30 * * * * *', function(){
  api.getMeasure(options, function(err, measure) {

    var data = lametricNetatmo.createLametricFormat(measure);
	  console.log("netatmo for lametric: "+data);
    optionsLametric.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
    const req = http.request(optionsLametric, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`response from netatmo to lametric req.: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      });
    });

    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(data);
    req.end();

  });
});

//send netatmo data to lametric 
var k = schedule.scheduleJob('40 * * * * *', function(){
 apistatus.meteoDataForLametric(optionsLametric);
});

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
    }

  }));

server.listen(PORT, function() {
  console.log("Server listening on: http://localhost:%s", PORT);
});
