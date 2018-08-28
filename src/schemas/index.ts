import * as mongoose from 'mongoose';
let dbURL: string = 'mongodb://localhost:27017/loj';

mongoose.connect(dbURL, { useNewUrlParser: true });

mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbURL);
});
mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});

let gracefulShutdown = (msg: string, callback: Function) => {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

process.once('SIGUSR2', function () {
	gracefulShutdown('nodemon restart', function () {
		process.kill(process.pid, 'SIGUSR2');
	});
});
process.on('SIGINT', function () {
	gracefulShutdown('app termination', function () {
		process.exit(0);
	});
});
process.on('SIGTERM', function () {
	gracefulShutdown('Heroku app termination', function () {
		process.exit(0);
	});
});

import './user';
