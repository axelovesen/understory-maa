require('express-async-errors'); // må være øverst

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');
var helmet = require('helmet');
var session = require('express-session');
var rateLimit = require('express-rate-limit');
var responseTime = require('response-time');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//logger for HTTP-requests
app.use(logger('dev'));

// sikkerhetsrelaterte HTTP-headers
app.use(helmet());

// CORS - tillater alle origins (endre til produksjon!)
app.use(cors());

//måler responstid
app.use(responseTime());

//parser for JSON og url-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.use(express.static(path.join(__dirname, 'public')));

//rate limit på API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutter
  max: 100, // maks 100 requests per IP
});

app.use('/api', apiLimiter);

//routene
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Enkel health-check (nyttig til load-test og debugging)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

module.exports = app;