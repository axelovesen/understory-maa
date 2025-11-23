require('dotenv').config();
require('express-async-errors'); // må være øverst

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

//Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

var app = express();
app.set('trust proxy', 1); // For å kunne brukes på dopleten

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  req.db = db;
  next();
});

//middleware setup
app.use(logger('dev'));//logger for HTTP-requests
app.use(helmet());// sikkerhetsrelaterte HTTP-headers
app.use(cors());// CORS - tillater alle origins (endre til produksjon!)
app.use(responseTime());//måler responstid
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
      secure: false, // setter vi til true når vi kjører HTTPS + trust proxy
      maxAge: 1000 * 60 * 60 * 24, // 1 dag
    },
  })
);

//gjør loggednn tilgjengelig i alle views, veldig viktig
app.use((req, res, next) => {
  res.locals.loggedIn = !!req.session.user;
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

//rate limit på API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutter
  max: 100, // maks 100 requests per IP
});

app.use('/api', apiLimiter);

// Enkel health-check (nyttig til load-test og debugging)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

//routes
app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;


/*

// HTTP request logging middleware
app.use((req, res, next) => {
    console.log("----- HTTP Request -----");
    console.log("method: ", req.method); // HTTP metode
    console.log("url:", req.originalUrl); // URL
    console.log("headers:", req.headers); // headers
    console.log("ip:", req.ip); // IP adresse
    console.log("body:", req.body); // body
    console.log("------------------------");
    next();
});

*/ 