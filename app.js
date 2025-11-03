/*
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//test

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
*/

// app.js (CommonJS)
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var helmet = require('helmet');
var cors = require('cors');
var rateLimit = require('express-rate-limit');
var session = require('express-session');
require('express-async-errors'); // fanger async-feil i express

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');        // <-- (lager vi straks)
var packagesRouter = require('./routes/packages'); // <-- (lager vi straks)

var app = express();

// ----- Views (EJS) -----
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ----- Sikkerhet + standard middleware -----
app.use(logger('dev'));
app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000'], credentials: true })); // legg til prod-domene senere
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'devsecret'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsession',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false } // secure:true i prod bak HTTPS
}));

// Rate limiting (DoS/brute-force beskyttelse)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Statisk
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Gjør user tilgjengelig i views (til blur-logikken)
app.use(function (req, res, next) {
  res.locals.user = req.session ? req.session.user : null;
  next();
});

// ----- Ruter -----
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter); // POST /login, /register, /logout
app.use('/api', packagesRouter);  // /packages (gated), /teaser/packages, /insights/...

// ----- 404 -----
app.use(function(req, res, next) {
  next(createError(404));
});

// ----- Error handler -----
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if (req.path.startsWith('/api/')) {
    return res.json({ error: err.message || 'Server error' });
  }
  res.render('error', { message: err.message, error: err });
});

module.exports = app;