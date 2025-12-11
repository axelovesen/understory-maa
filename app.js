require('dotenv').config();
require('express-async-errors'); //må være øverst

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

//sikkerhet
var cors = require('cors');
var helmet = require('helmet');
var rateLimit = require('express-rate-limit');
var responseTime = require('response-time');

//db kobling
const db = require('./db');

//routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

var app = express();
app.set('trust proxy', 1); //brukes for å kunne brukes på dopleten

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  req.db = db;
  next();
});

//middleware setup
app.use(logger('dev'));//logges for HTTP requests
app.use(helmet());//HTTP headers
app.use(cors()); //cors
app.use(responseTime());//måler responstidenm
app.use(express.json());//parser for JSON bodies
app.use(express.urlencoded({ extended: false }));//parser for url-encoded bodies

//cookies og session
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // setter vi til true når vi kjører HTTPS+trust proxy
      maxAge: 1000 * 60 * 60 * 24, //=1 dag
    },
  })
);

//gjør loggednn tilgjengelig i alle views, veldig viktig
app.use((req, res, next) => {
  res.locals.loggedIn = !!req.session.user;
  res.locals.currentUserId = req.session.userId || null;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

//rate limit på API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //settes til 15 minutter
  max: 100, //maks 100 requests på IP kall
});

app.use('/api', apiLimiter);

//health-check for laod test og debugging
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

app.get('/om_oss', (req, res) => {
  const loggedIn = !!req.session.user;
  res.render('om_oss', { loggedIn });
});

//routes
app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;