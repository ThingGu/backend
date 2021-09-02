const express = require("express");
const morgan = require('morgan');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const reportRouter = require('./routes/report');
const blockRouter = require('./routes/block');

const babProfileRouter = require('./routes/babProfile');
const sulProfileRouter = require('./routes/sulProfile');

const app = express();

app.set('port', process.env.PORT || 5001);
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/report', reportRouter);
app.use('/api/block', blockRouter);

app.use('/api/babProfile', babProfileRouter);
app.use('/api/sulProfile', sulProfileRouter);

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});