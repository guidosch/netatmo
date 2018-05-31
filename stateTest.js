var http = require('http');
var foo = 0;
http.createServer(function (req, res) {
  foo += 1;
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('You are foo number ' + foo + '\n');
}).listen(1337, '192.168.2.39');
console.log('Server running at http://192.168.2.39:1337/');