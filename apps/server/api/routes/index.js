const express = require('express');
const { logAction } = require('../../src/logs.js');
const registerRoute = require('./register');
const stateRoute = require('./state');

function expressJsonWrapper(req, res, next) {
	express.json()(req, res, err => {
		if (err) {
			logAction(console.error, 'An error occured while parsing the request\'s JSON');
			console.error(err);
			return res.status(400).json({
				message: 'The request is incorrect...',
				details: 'The body is not JSON formatted.',
			});
		}
		next();
	});
}

module.exports = (discord) => {

	const route = express.Router();

	route.use(expressJsonWrapper);
	route.use(express.json());
	route.use('/register', registerRoute(discord));
	route.use('/state', stateRoute());

	return route;
  
};
