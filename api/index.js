const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');

module.exports = (discord) => {

	const app = express();

	app.use(cors());
	app.use('/', apiRoutes(discord));

	return app;

};
