
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , csv = require('csv')
  , path = require('path');
var records = new Array();
var app = express();
  var mongodb = require('mongodb');
  var server = new mongodb.Server("127.0.0.1", 27017, {});
  csv()
  .from.stream(fs.createReadStream(__dirname+'/contract.txt'), {
    columns: true
  })
  .on('record', function(row,index){
  new mongodb.Db('contract_test', server, {}).open(function (error, client) {
  if (error) throw error;
    var collection = new mongodb.Collection(client, 'contracts');
    collection.insert(row, {safe:false},
      function(err, objects) {
       if (err) console.warn(err.message);
       if (err && err.message.indexOf('E11000 ') !== -1) {
         // this _id was already inserted in the database
       }
    });
});

  })
  .on('end', function(count){
    console.log('Number of lines: '+count);
  });

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
