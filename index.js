// Generated by CoffeeScript 1.8.0
(function() {
  var MongoStore, app, bodyParser, cookieParser, express, mongodbclient, multer, session, tvdbWebService;

  tvdbWebService = require('tvdbwebservice');

  express = require('express');

  app = express();

  app.set('port', process.env.PORT || 5000);

  app.set('tvdbApiKey', process.env.TVDB_API_KEY);

  app.use(express["static"](__dirname + '/public'));

  tvdbWebService.setTvdbApiKey(app.get('tvdbApiKey'));

  mongodbclient = require('./mongodbclient.js');

  mongodbclient.setDbConfig(process.env["DB_USER"], process.env["DB_PASSWORD"]);

  cookieParser = require('cookie-parser');

  app.use(cookieParser());

  session = require('express-session');

  MongoStore = require('connect-mongo')(session);

  app.use(session({
    "secret": 'foo',
    "store": new MongoStore({
      "url": "mongodb://tvserieswebappadmin:s4U-dxF-SrA-dLa@ds029640.mongolab.com:29640/tvserieswebappdatabase"
    })
  }));

  bodyParser = require('body-parser');

  multer = require('multer');

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(multer());

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.get('/series/seriesName/:name', function(req, res) {
    tvdbWebService.getSeriesByName(req.params.name, function(data) {
      res.end(data);
    });
  });

  app.get('/series/seriesId/:id/seriesPlusActorsPlusBanners', function(req, res) {
    tvdbWebService.getSeriesPlusActorsPlusBannersById(req.params.id, function(data) {
      res.end(data);
    });
  });

  app.get('/series/seriesId/:id/seriesOnly', function(req, res) {
    tvdbWebService.getSeriesOnlyById(req.params.id, function(data) {
      res.end(data);
    });
  });

  app.get('/series/seriesId/:id/actors', function(req, res) {
    tvdbWebService.getActorsForSeriesWithId(req.params.id, function(data) {
      res.end(data);
    });
  });

  app.get('/series/seriesId/:id/banners/', function(req, res) {
    tvdbWebService.getBannersForSeriesWithId(req.params.id, function(data) {
      res.end(data);
    });
  });

  app.get('/', function(req, res) {
    res.end('Welcome to tvserieswebserver');
  });

  app.listen(app.get('port'), function() {
    console.log("Node app is running at" + app.get('port'));
  });


  /*
  app.get '/signup', (req, res)  ->
    res.end 'Welcome to signup page'
    return
   */

  app.post('/signup', function(req, res) {
    return mongodbclient.addNewUser({
      "first-name": req.body['first-name'],
      "last-name": req.body['last-name'],
      "username": req.body['username'],
      "email": req.body['email'],
      "password": req.body['password']
    }, function(user) {
      session.username = user.username;
      session.password = user.password;
      session.email = user.email;
      session["signin-status"] = true;
      res.redirect('/');
    });
  });

  app.get('/signin-status', function(req, res) {
    if (session.username) {
      session["signin-status"] = true;
    } else {
      session["signin-status"] = false;
    }
    res.end(JSON.stringify({
      "first-name": session["first-name"],
      "email": session["email"],
      "username": session["username"],
      "signin-status": session["signin-status"]
    }));
  });

}).call(this);
