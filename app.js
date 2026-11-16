var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var expedienteRouter = require('./routes/expediente');
var subregionRouter = require('./routes/subregion');
var masterRouter = require('./routes/master');
var consultaRouter = require('./routes/consulta');

var app = express();

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/expediente', expedienteRouter);
app.use('/subregion', subregionRouter);
app.use('/master', masterRouter);
app.use('/consulta', consultaRouter);

app.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/login');
  });
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
