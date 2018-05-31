var auth = require('./myNetatmoAuth.js');
var netatmo = require('netatmo');
var http = require('http');
var dispatch = require('dispatch');
var schedule = require('node-schedule');
var apistatus = require('./meteoDataAPIStatus.js');
var lametricNetatmo = require('./lametricNetatmo.js');
var devices = require('./devices.js');
var util = require('./util.js');

const PORT = 8000;
const HEADERS = util.HEADERS;
var api = new netatmo(auth());
var result = {};


function readFromNetatmoAPI() {
  api.getMeasure(devices.optionsMainStation, function (err, measure) {
    /**
    measure object looks like this:
    { beg_time: 1452028500, value: [ [ 21.7, 1532, 61 ] ] }
    **/
    result.temperatureMain = measure[0].value[0][0];
    result.co2Main = measure[0].value[0][1];
    result.humidityMain = measure[0].value[0][2];
  });
  api.getMeasure(devices.optionsModuleRoom, function (err, measure) {
    /**
    measure object looks like this:
    { beg_time: 1452028500, value: [ [ 21.7, 1532, 61 ] ] }
    **/
    result.temperatureRoom = measure[0].value[0][0];
    result.co2Room = measure[0].value[0][1];
    result.humidityRoom = measure[0].value[0][2];
  });
  api.getMeasure(devices.optionsModuleOutside, function (err, measure) {
    /**
    measure object looks like this:
    { beg_time: 1452028500, value: [ [ 21.7, 1532, 61 ] ] }
    **/
    result.temperatureOutside = measure[0].value[0][0];
    result.humidityOutside = measure[0].value[0][1];
  });
}

var j = schedule.scheduleJob('60 * * * * *', function(){
  readFromNetatmoAPI();
});

//send netatmo data to lametric 
var j = schedule.scheduleJob('30 * * * * *', function(){
  
    var data = lametricNetatmo.createLametricFormat(result);
	  console.log("netatmo for lametric: "+data);
    lametricNetatmo.optionsLametric.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
    const req = http.request(lametricNetatmo.optionsLametric, (res) => {
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

//send sma station opendata  to lametric 
var k = schedule.scheduleJob('40 * * * * *', function(){
 apistatus.meteoDataForLametric(lametricNetatmo.optionsLametric);
});

//todo get data from raspi, and display in loxone webpage, ev. auch was mit counter und time??? machen wie watchdog oder so
var server = http.createServer(
  dispatch({
    '/netatmo': function(request, response){
      response.writeHead(200, HEADERS);
      response.end(JSON.stringify(result));
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

//initialize data
readFromNetatmoAPI();

