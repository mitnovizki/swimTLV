const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');// built in
const bodyParser = require('body-parser');
const passport = require('passport');// deal with maintaining your user oject in the session, serialized, session
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;
const sql = require('mssql');

const config = {
  user: 'fitnetadmin',
  password: 'Gyhwem-4vixfa-popwep',
  server: 'fitnet.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
  database: 'FitnetDB',
  opitons: { encrypt: true }
};

sql.connect(config).catch((err) => debug(err));
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // pull out our post and add it to our body
app.use(cookieParser()); // ()-meaning is being executed (middlwear)
app.use(session({ secret: 'fitnetsecreto' }));

require('./src/config/passport.js')(app);

app.use((req, res, next) => {
  debug('my middlewear');
  next();
});
app.use(express.static(path.join(__dirname, '/public/')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css/')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js/')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist/')));

app.set('views', './src/views');
app.set('view engine', 'ejs');
const nav = [
  { link: '/fitnet', title: 'Home' },
  { link: '#intro', title: 'Intro' },
  { link: '#services', title: 'Services' },
  { link: '#team', title: 'Team' },
  { link: '#pricing', title: 'Pricing' },
  { link: '#linksFromPdf', title: 'Links' }
];

const disciplineRouter = require('./src/routes/disciplineRoutesMongo')(nav); // disciplineroutes is a function
const adminRouter = require('./src/routes/adminRoutes')(nav);
const authRouter = require('./src/routes/authRoutes')(nav);

app.use('/fitnet', disciplineRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
// app.listen(3000, function () {
//     console.log('listening to port' + chalk.green(3000))
// });

// app.listen(3000, function () {
//     console.log(`listening to port ${chalk.green(3000)}`)
// });

app.listen(port, () => {
  debug(`listening at port ${chalk.green(port)}`);
});

// works
// app.get('/', (req, res) => {
// eslint-disable-next-line max-len
// res.sendFile(path.join(__dirname, 'views/index.html'));
// __dirname = current executable | path = create valid // path to file
// });
