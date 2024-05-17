const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const expressWaf = require('express-waf');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const util = require('util');
const cors = require('cors');
const os = require('os');
const cron = require('node-cron');
const formData = require('express-form-data');
const mongoClient = require('./ClientMongo/MongoClientTransaction');
const indexRouter = require('./routes/')

const { errorHandler, asyncErrorHandler, notFoundHandler } = require('./middlewares/errorHandlers');


// Debugging mongoose queries
mongoose.set('debug', true);

const app = express();

//app.use(morganMiddleware);

app.use(cors());

const options = {
  uploadDir: os.tmpdir(),
  autoClean: true,
};
// parse data with connect-multiparty.
// app.use(formData.parse(options));
// delete from the request all empty files (size == 0)
// app.use(formData.format());
// change the file objects to fs.ReadStream
// app.use(formData.stream());
// union the body and the files
// app.use(formData.union());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());

app.all('/*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  next();
});

// Web Application Firewall
// Initialize express-waf with the desired configuration
const emudb = new expressWaf.EmulatedDB();

const waffConfig = {
  mode: 'blocking',
  ruleSets: {
    owasp: true,
    custom: [
      {
        id: '1001',
        message: 'Custom rule: Block requestswith User-Agent "BadBot"',
        regex: /BadBot/i,
        target: 'headers',
        action: 'block',
      },
      {
        id: '1008',
        message: 'Custom rule: Block XSS attempts',
        regex: /<script[\s\S]*?>[\s\S]*?<\/script>/i,
        target: 'body',
        action: 'block',
      },
      {
        id: '1009',
        message: 'Custom rule: Block attempts to include arbitrary files',
        regex: /(include|require)\s*\(/i,
        target: 'body',
        action: 'block',
      },
      {
        id: '1010',
        message: 'Custom rule: Block command injection attempts',
        regex: /(exec|system|passthru|shell_exec)\s*\(/i,
        target: 'body',
        action: 'block',
      },
      {
        id: '1011',
        message: 'Custom rule: Block authentication bypass attempts',
        regex: /(admin\s*=\s*1|OR\s*1\s*=\s*1)/i,
        target: 'body',
        action: 'block',
      },
      {
        id: '1012',
        message: 'Custom rule: Block CSRF attempts',
        regex: /(\bcsrfToken\b|\b_csrf\b)/i,
        target: 'body',
        action: 'block',
      },
      {
        id: '1013',
        message: 'Custom rule: Block Denial-of-Service (DoS) attacks',
        regex: /((\bping\b|\bflood\b|\budp\b)\s*(\battack\b)?)/i,
        target: 'body',
        action: 'block',
      },
      {
        id: '1014',
        message: 'Custom rule: Block attempts to include sensitive files',
        regex: /(\/etc\/passwd|\/etc\/shadow)/i,
        target: 'body',
        action: 'block',
      },
      {
        id: '1015',
        message: 'Custom rule: Block brute force attacks',
        regex: /(login\s+attempts\s+exceeded|brute\s+force)/i,
        target: 'body',
        action: 'block',
      },
      {
        id: '1016',
        message: 'Custom rule: Block insecure deserialization attempts',
        regex: /(\bunserialize\b|\bdeserialize\b)/i,
        target: 'body',
        action: 'block',
      },
      {
        id: '1017',
        message: 'Custom rule: Block excessive requests from the same IP address',
        regex: null,
        target: 'rateLimit',
        action: 'limit',
        limit: 50, // Nombre maximum de requêtes par seconde (ajustez selon vos besoins)
        interval: 60, // Intervalle de temps en secondes pour la limite (par exemple, 60 pour une limite par minute)
        scope: 'ip', // Limiter par adresse IP
      }


    ],
  },
  blocker:{
    db: emudb,
    blockTime: 1000
  },
  log: true
}
const waf = new expressWaf.ExpressWaf(waffConfig);

// Use express-waf middleware
app.use(waf.check);



app.use('/assets', express.static('assets'));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/xkorin/api/v1', indexRouter);


// catch 404 and forward to error handler
app.use(errorHandler);
app.use(notFoundHandler);
app.use(asyncErrorHandler)

// Demonstrate the readyState and on event emitters
// console.log(mongoose.connection.readyState); //logs 0
mongoose.connection.on('connecting', () => {
  console.log('connecting');
  // console.log(mongoose.connection.readyState); //logs 2
});
mongoose.connection.on('connected', () => {
  console.log('connected');
  // console.log(mongoose.connection.readyState); //logs 1
});
mongoose.connection.on('disconnecting', () => {
  console.log('disconnecting');
  // console.log(mongoose.connection.readyState); // logs 3
});
mongoose.connection.on('disconnected', () => {
  console.log('disconnected');
// console.log(mongoose.connection.readyState);
//logs 0
});

mongoose.set('strictQuery', true);
mongoose.connect(`${process.env.MONGODB_URI}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

 //mongoClient.connect()

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// cron.schedule("* * * * *", function () {
//   console.log("===========cron =======")
//   emailSend.cronEmail();
// });

module.exports = app;
  