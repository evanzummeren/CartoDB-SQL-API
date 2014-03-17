require('../helper');
require('../support/assert');

var assert = require('assert')
    , App = require(global.settings.app_root + '/app/controllers/app')
    , querystring = require('querystring')
    , _ = require('underscore')
    , Step = require('step')
    , net = require('net')
    ;

var sql_server_port = 5556;
var sql_server = net.createServer(function(c) {
  console.log('server connected');
  c.destroy();
  console.log('server socket destroyed.');
  sql_server.close(function() {
  console.log('server closed');
  });
});

suite('backend crash', function() {

suiteSetup(function(done){
  sql_server.listen(sql_server_port, done);
});

// See https://github.com/CartoDB/CartoDB-SQL-API/issues/135
test.skip('does not hang server', function(done){
//console.log("settings:"); console.dir(global.settings);
  var db_host_backup = global.settings.db_host;
  var db_port_backup = global.settings.db_port;
  global.settings.db_host = 'localhost';
  global.settings.db_port = sql_server_port;
  var app = App();
  Step(
    function sendQuery() {
      var next = this;
      assert.response(app, {
          url: '/api/v1/sql?q=SELECT+1',
          method: 'GET',
          headers: {host: 'vizzuality.localhost' }
      },{}, function(res, err) {
          next(err, res);
      });
    },
    function checkResponse(err, res) {
      assert.ok(err);
      assert.ok(err.message.match(/hang up/), err);
      return null;
    },
    function finish(err) {
      global.settings.db_host = db_host_backup;
      global.settings.db_port = db_port_backup;
      done(err);
    }
  );
});

suiteTeardown(function(done) {
  try {
    sql_server.close(done);
  } catch (er) {
    console.log(er);
    done(); // error expected as server is probably closed already
  }
});

});
