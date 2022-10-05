var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 1. 라우터 경로
var indexRouter = require('./routes/index');
var homeRouter = require('./routes/home');
var usersRouter = require('./routes/users');
var registerRouter = require('./routes/register');
var listRouter = require('./routes/list');
var detailRouter = require('./routes/detail');
var profileRouter = require('./routes/profile');
var paymentRouter = require('./routes/payment');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 2. 사용할 페이지경로 설정(routes폴더 파일)  3. js파일 만들고 값을 ejs로 던져줌
app.use('/', indexRouter);
app.use('/home', homeRouter);
app.use('/register', registerRouter);
app.use('/list', listRouter);
app.use('/detail', detailRouter);
app.use('/profile', profileRouter);
app.use('/payment', paymentRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
