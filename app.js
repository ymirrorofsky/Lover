var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var app = express();

// 引入配置文件
var settings = require('./setting');
// 引入 flash 插件
var flash = require('connect-flash');
// 引入会话插件
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 使用flash插件
app.use(flash());
// 使用 session 插件
app.use(session({
  secret:settings.cookieSecret,
  key:settings.db,
  cookies:{maxAge:1000*60*60*24*30},
  store:new MongoStore({
    url:'mongodb://localhost/darling'
  }),
  resave:false,
  saveUninitialized:'true'
}))

routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//让整个应用启动起来
app.listen(3000,function(){
  console.log('node is OK');
})
module.exports = app;
