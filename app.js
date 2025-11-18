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

var app = express();

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
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;


/*var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

// routers
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var cookieRouter = require('./routes/cookie');
var authRouter = require('./routes/auth');
var middlewareRouter = require('./routes/middleware');

var app = express();

// middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// express-session middleware
app.set('trust proxy', 1); // hvis bagved en proxy (for eksempel nginx)
app.use(session({
    secret: 'mwndigi', // random nøgle til at signere cookie ID
    resave: false, // lagrer ikke hvis session ikke er ændret
    saveUninitialized: false, // lagrer ikke session før den er modificeret
    cookie: {
        httpOnly: true,      // forhindrer client-side JS fra at tilgå cookie
        sameSite: 'strict',  // forhindrer Cross-Site Request Forgery (CSRF)
        maxAge: 24 * 60 * 60 * 1000, // sætter cookie til at udløbe efter 1 dag
        // secure: true,        // sikrer cookies kun sendes over HTTPS. Prøv at kommentere ind
    }
}));

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