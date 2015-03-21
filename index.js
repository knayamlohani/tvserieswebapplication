// Generated by CoffeeScript 1.8.0
(function() {
  var MongoStore, app, bodyParser, cookieParser, dashboardHTML, dashboardTemplate, express, fs, handlebars, http, indexHTML, indexTemplate, mongodbclient, multer, path, redirect, seriesHTML, seriesTemplate, server, session, signinHTML, signinTemplate, signupHTML, signupTemplate, tvdbWebService;

  tvdbWebService = require('tvdbwebservice');

  express = require('express');

  app = express();

  fs = require("fs");

  path = require('path');

  http = require('http');

  handlebars = require("handlebars");

  app.set('port', process.env.PORT);

  app.set('tvdbApiKey', process.env.TVDB_API_KEY);

  tvdbWebService.setTvdbApiKey(app.get('tvdbApiKey'));

  mongodbclient = require('./mongodbclient.js');

  mongodbclient.setDbConfig(process.env["DB_USER"], process.env["DB_PASSWORD"]);

  cookieParser = require('cookie-parser');

  app.use(cookieParser());

  session = require('express-session');

  MongoStore = require('connect-mongo')(session);

  handlebars.registerHelper('raw-helper', function(options) {
    return options.fn();
  });

  app.use(session({
    "secret": '67gvgchgch987jbcfgxdfmhye435jvgxzdzf',
    "store": new MongoStore({
      "url": "mongodb://" + process.env["DB_USER"] + ":" + process.env["DB_PASSWORD"] + "@ds029640.mongolab.com:29640/tvserieswebappdatabase",
      "ttl": 1 * 24 * 60 * 60 * 1000
    }),
    "cookie": {
      "maxAge": 1 * 24 * 60 * 60 * 1000
    },
    "resave": false,
    "saveUninitialized": true
  }));

  bodyParser = require('body-parser');

  multer = require('multer');

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(multer());

  indexHTML = fs.readFileSync("public/index.html", "utf8");

  seriesHTML = fs.readFileSync("public/series.html", "utf8");

  signupHTML = fs.readFileSync("public/account/signup.html", "utf8");

  signinHTML = fs.readFileSync("public/account/signin.html", "utf8");

  dashboardHTML = fs.readFileSync("public/account/dashboard.html", "utf8");

  indexTemplate = handlebars.compile(indexHTML);

  seriesTemplate = handlebars.compile(seriesHTML);

  signupTemplate = handlebars.compile(signupHTML);

  signinTemplate = handlebars.compile(signinHTML);

  dashboardTemplate = handlebars.compile(dashboardHTML);

  redirect = "";


  /*================================================================================================
  Routs
  ================================================================================================
   */

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

  app.get('/series?id=:id/episode?airDate=:airDate', function(req, res) {
    tvdbwebservice.getEpisodeAiredOnDateForSeriesWithId(req.params.airDate, req.params.id, function(data) {
      res.end(data);
    });
  });

  app.get('/', function(req, res) {
    var result, signinObject;
    console.log("requesting series homepage");
    if (!indexTemplate) {
      indexHTML = fs.readFileSync("public/index.html", "utf8");
      indexTemplate = handlebars.compile(indexHTML);
    }
    signinObject = {
      "firstName": "",
      "lastName": "",
      "username": "",
      "email": "",
      "signinStatus": false,
      "signinPage": "/signin?redirect=/",
      "dashboardPage": "",
      "status": "Sign in",
      "toggle": "",
      "signout": ""
    };
    if (req.session.username) {
      signinObject = {
        "firstName": req.session["firstName"],
        "lastName": req.session["lastName"],
        "username": req.session.username,
        "email": req.session.email,
        "signinStatus": true,
        "signinPage": "",
        "dashboardPage": "/dashboard",
        "status": req.session.username,
        "toggle": "dropdown",
        "signout": "/signout?redirect=/"
      };
    }
    result = indexTemplate(signinObject);
    console.log("account:", signinObject);
    res.writeHead(200, {
      "Context-Type": "text/html"
    });
    res.write(result);
    res.end();
  });

  app.get('/series', function(req, res) {
    var result, seriesPageData, template;
    console.log('requesting series', req.query);
    if (!seriesHTML) {
      indexHTML = fs.readFileSync("public/series.html", "utf8");
    }
    seriesPageData = {
      "firstName": "",
      "lastName": "",
      "username": "",
      "email": "",
      "signinStatus": false,
      "signinPage": "/signin?redirect=/series",
      "dashboardPage": "",
      "status": "Sign in",
      "toggle": "",
      "name": req.query.name,
      "id": req.query.id,
      "signout": ""
    };
    if (req.session.username) {
      seriesPageData = {
        "firstName": req.session["firstName"],
        "lastName": req.session["lastName"],
        "username": req.session.username,
        "email": req.session.email,
        "signinStatus": true,
        "signinPage": "",
        "dashboardPage": "/dashboard",
        "status": req.session.username,
        "toggle": "dropdown",
        "name": req.query.name,
        "id": req.query.id,
        "signout": "/signout?redirect=/series"
      };
    }
    template = handlebars.compile(seriesHTML);
    result = template(seriesPageData);
    res.writeHead(200, {
      "Context-Type": "text/html"
    });
    res.write(result);
    res.end();
  });

  app.post('/signup', function(req, res) {
    req.session["firstName"] = "";
    req.session["lastName"] = "";
    req.session.username = "";
    req.session.email = "";
    req.session["signinStatus"] = false;
    mongodbclient.checkIfEmailAlreadyRegistered(req.body.email, function(mailStausResult) {
      console.log("found status", mailStausResult);
      if (!mailStausResult.status) {
        mongodbclient.addNewUser({
          "firstName": req.body["firstName"],
          "lastName": req.body["lastName"],
          "username": req.body["username"],
          "email": req.body["email"],
          "password": req.body["password"]
        }, function(result) {
          req.session["firstName"] = result.data["firstName"];
          req.session["lastName"] = result.data["lastName"];
          req.session.username = result.data.username;
          req.session.email = result.data.email;
          req.session["signinStatus"] = true;
          res.redirect('/');
        });
      } else {
        res.redirect('/account/signup.html');
      }
    });
  });

  app.get('/signin-status', function(req, res) {
    if (req.session.username) {
      req.session["signin-status"] = true;
    } else {
      req.session["signin-status"] = false;
    }
    res.end(JSON.stringify({
      "firstName": req.session["firstName"],
      "email": req.session["email"],
      "username": req.session["username"],
      "signinStatus": req.session["signinStatus"]
    }));
  });

  app.get('/signout', function(req, res) {
    req.session.destroy(function(err) {
      res.redirect(req.query.redirect);
    });
  });

  app.get('/signin', function(req, res) {
    var result, signinObject;
    console.log("redirect", req.query.redirect);
    redirect = req.query.redirect;
    res.writeHead(200, {
      "Context-Type": "text/html"
    });
    signinObject = {
      "email": "",
      "errorMessage": ""
    };
    if (!signinTemplate) {
      signinHTML = fs.readFileSync("public/signin.html", "utf8");
      signinTemplate = handlebars.compile(signinHTML);
    }
    result = signinTemplate(signinObject);
    res.write(result);
    res.end();
  });

  app.post('/signin', function(req, res) {
    mongodbclient.authenticateUserCredentials(req.body.email, req.body.password, function(result) {
      req.session.username = result.data.username;
      req.session["firstName"] = result.data.firstName;
      req.session["lastName"] = result.data.lastName;
      req.session["email"] = result.data.email;
      req.session["username"] = result.data.username;
      req.session["signinStatus"] = result.data["signinStatus"];
      if (req.session["signinStatus"]) {
        res.redirect(redirect);
      } else {
        res.writeHead(200, {
          "Context-Type": "text/html"
        });
        if (!signinTemplate) {
          signinHTML = fs.readFileSync("public/account/signin.html", "utf8");
          signinTemplate = handlebars.compile(signinHTML);
        }
        result.data["errorMessage"] = "Either the username or password you entered is wrong";
        result = signinTemplate(result.data);
        res.write(result);
        res.end();
      }
    });
  });

  app.get('/dashboard', function(req, res) {
    var result, signinObject;
    console.log("requesting dashboard");
    if (!req.session["signinStatus"]) {
      return res.redirect('/signin');
    } else {
      signinObject = {
        "firstName": req.session["firstName"],
        "lastName": req.session["lastName"],
        "username": req.session.username,
        "email": req.session.email,
        "signinStatus": true,
        "signinPage": "",
        "dashboardPage": "/dashboard",
        "status": req.session.username,
        "toggle": "dropdown",
        "signout": "/signout?redirect=/"
      };
      res.writeHead(200, {
        "Context-Type": "text/html"
      });
      if (!dashboardTemplate) {
        dashboardHTML = fs.readFileSync("public/account/dashboard.html", "utf8");
        dashboardTemplate = handlebars.compile(dashboardHTML);
      }
      result = dashboardTemplate(signinObject);
      res.write(result);
      return res.end();
    }
  });

  app.get('/subscriptions', function(req, res) {
    if (!req.session["signinStatus"]) {
      res.redirect('/signin');
    } else {
      mongodbclient.getSubscribedTvShows(req.session.username, function(result) {
        console.log("result is ", result);
        console.log("sending server data to client");
        res.end(JSON.stringify(result, null, 4));
      });
    }
  });

  app.get('/subscribe', function(req, res) {
    var subscribingTvSeries;
    if (!req.session["signinStatus"]) {
      res.redirect('/signin?redirect=/series');
    } else {
      subscribingTvSeries = {
        "subscribersUsername": req.session.username,
        "subscribersFirstName": req.session.firstName,
        "subscribersLastName": req.session.lastName,
        "subscribersEmail": req.session.email,
        "id": req.query.id,
        "name": req.query.name,
        "artworkUrl": req.query.artworkUrl,
        "airsOnDayOfWeek": req.query.airsOnDayOfWeek
      };
      mongodbclient.addSeriesToSubscribedTvShows(subscribingTvSeries, function(result) {
        return res.end(JSON.stringify(result, null, 4));
      });
    }
  });

  app.get('/unsubscribe', function(req, res) {
    var unsubscribingTvSeries;
    if (!req.session["signinStatus"]) {
      res.redirect('/signin?redirect=/series');
    } else {
      unsubscribingTvSeries = {
        "subscribersUsername": req.session.username,
        "id": req.query.id
      };
      mongodbclient.removeSeriesFromSubscribedTvShows(unsubscribingTvSeries, function(result) {
        console.log(result);
        return res.end(JSON.stringify(result, null, 4));
      });
    }
  });

  app.get('/subscriptions/getSeries', function(req, res) {
    if (req.session.signinStatus) {
      console.log("checking subscription status for series with id", req.query.id);
      mongodbclient.getSubscriptionStatusForSeriesWidth(req.query.id, req.session.username, function(result) {
        return res.end(JSON.stringify(result, null, 4));
      });
    } else {
      res.end(JSON.stringify({
        "err": null,
        "status": false,
        "data": ""
      }));
    }
  });

  console.log("Attempting to start server at " + (app.get('port')));

  server = http.createServer(app).listen(app.get('port'), function() {
    var address, powFile, powHost;
    address = server.address();
    console.log("Node app is running at ", address);
    if (process.platform === 'darwin') {
      powHost = "webapp.tvseries";
      powFile = path.resolve(process.env['HOME'], ".pow/" + powHost);
      fs.writeFile(powFile, address.port, (function(_this) {
        return function(err) {
          var unhost;
          if (err) {
            return console.error(err);
          }
          console.log("Hosted on: " + powHost + ".dev");
          unhost = function() {
            var e;
            try {
              fs.unlinkSync(powFile);
              console.log("Unhosted from: " + powHost + ".dev");
            } catch (_error) {
              e = _error;
              if (err) {
                return console.error(err);
              }
            }
          };
          process.on('SIGINT', function() {
            unhost();
            process.exit();
          });
          return process.on('exit', function(code) {
            unhost();
          });
        };
      })(this));
    }
  });

  app.use(express["static"](__dirname + '/public'));

  (function() {
    var currentDay, days, subscribers;
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    currentDay = days[(new Date()).getDay()];
    subscribers = {};
    mongodbclient.getTvShowsAiringOn(currentDay, function(result) {
      var tvShow, _i, _len, _ref;
      console.log("TV Shows Airing on " + currentDay + " -\n", result);
      _ref = result.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tvShow = _ref[_i];
        console.log("show -", tvShow.subscribersUsername);
        if (!subscribers[tvShow.subscribersUsername]) {
          subscribers[tvShow.subscribersUsername] = [];
        }
        subscribers[tvShow.subscribersUsername].push(tvShow);
      }
      console.log("subscribers today -\n", subscribers);
    });
  })();

}).call(this);


//# sourceMappingURL=index.js.map
