var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const db = require('./services/db.js');
var index = require('./routes/index');
var sell = require('./routes/sell.js');
var center = require('./routes/center.js');
var item = require('./routes/item.js');
var myGallery = require('./routes/myGallery.js');
var todayMore = require('./routes/todayMore.js');
var myOffer = require('myOffer.js');
const helmet = require('helmet');
var hbs = require('hbs');
const session = require('express-session');
var lessCompiler = require('less-compiler');
var lessPath = __dirname + '/public/stylesheets';
var cssPath = __dirname + '/public/stylesheets';

var compiler = lessCompiler({
  src: path.join(lessPath, 'style_less.less'), // the less file with all your imports
  dest: cssPath // the directory where all your compiled CSS files go
});

// watch the parent directory of the src file
compiler.watch();

var app = express();
app.use(session({
  secret: 'guoxuan',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}))
app.use(helmet());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

var blocks = {};

hbs.registerHelper('extend', function(name, context) {
  var block = blocks[name];
  if (!block) {
    block = blocks[name] = [];
  }

  block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function(name) {
  var val = (blocks[name] || []).join('\n');

  // clear the block
  blocks[name] = [];
  return val;
});

app.use('/', index);
app.use('/sell', sell);
app.use('/center', center);
app.use('/item', item);
app.use('/myGallery', myGallery);
app.use('/todayMore', todayMore);
app.use('/myOffer', myOffer);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
