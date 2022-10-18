const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const oracledb = require('oracledb');
oracledb.autoCommit = true;

// 1. 라우터 경로
const indexRouter = require('./routes/index');
const homeRouter = require('./routes/user/home');
const adminRouter = require('./routes/admin/main');
const loginRouter = require('./routes/login');
const joinRouter = require('./routes/join');
const registerRouter = require('./routes/user/register');
const listRouter = require('./routes/user/list');
const detailRouter = require('./routes/user/detail');
const profileRouter = require('./routes/user/profile');
const editRouter = require('./routes/user/edit');
const paymentRouter = require('./routes/user/payment');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.use(expressLayouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// 세션 설정
app.use( // request를 통해 세션 접근 가능 ex) req.session
  session({
    // key: "loginData",
    secret: "keyboard cat", // 반드시 필요한 옵션. 세션을 암호화해서 저장함
    resave: false, // 세션 변경되지 않아도 계속 저장됨. 기본값은 true지만 false로 사용 권장
    saveUninitialized: true, // 세션을 초기값이 지정되지 않은 상태에서도 강제로 저장. 모든 방문자에게 고유 식별값 주는 것.
    cookie: {
      maxAge: 3600000
    },
    rolling: true
    // store: new MYSQLStore(connt),
  })
);

// 전역 변수 (로그인하면 세션정보를 변수에 저장)
app.use(function (req, res, next) {
  if (req.session.user) {
    global.sessionId = req.session.user.sessionId;
    global.sessionNo = req.session.user.sessionNo;
    global.sessionName = req.session.user.sessionName;
    global.sessionAddr1 = req.session.user.sessionAddr1;
    global.sessionAddr2 = req.session.user.sessionAddr2;
  } else{
    global.sessionId = undefined;
    global.sessionNo = undefined;
    global.sessionName = undefined;
    global.sessionAddr1 = undefined;
    global.sessionAddr2 = undefined;
  }
  next();
});

// 2. 사용할 페이지경로 설정(routes폴더 파일)  3. js파일 만들고 값을 ejs로 던져줌
app.use('/', indexRouter);
app.use('/home', homeRouter);
app.use('/register', registerRouter);
app.use('/list', listRouter);
app.use('/detail', detailRouter);
app.use('/profile', profileRouter);
app.use('/edit', editRouter);
app.use('/payment', paymentRouter);
app.use('/login', loginRouter);
app.use('/join', joinRouter);
app.use('/admin', adminRouter);

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
