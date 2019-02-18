
let assert = require("assert");
let sinon = require("sinon");
let https = require("https");
let chai = require("chai");
let openweather = require("./openweathermap.js");
let should = chai.should();

const base = "https://api.openweathermap.org";

describe("when stubbed", () => {
  beforeEach(() => {
    this.get = sinon.stub(https, "get");
  });
  afterEach(() => {
    request.restore();
  });

  describe("GET /api/v1/movies", () => {
    it("should return all movies", (done) => {
      request.get(`${base}/api/v1/movies`, (err, res, body) => {
        // there should be a 200 status code
        res.statusCode.should.eql(200);
        // the response should be JSON
        res.headers["content-type"].should.contain("application/json");
        // parse response body
        body = JSON.parse(body);
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        body.status.should.eql("success");
        // the JSON response body should have a
        // key-value pair of {"data": [3 movie objects]}
        body.data.length.should.eql(3);
        // the first object in the data array should
        // have the right keys
        body.data[0].should.include.keys(
          "id", "name", "genre", "rating", "explicit"
        );
        // the first object should have the right value for name
        body.data[0].name.should.eql("The Land Before Time");
        done();
      });
    });
  });


});