const Joi = require('joi');

function register(body) {
	const schema = Joi.object({
		code: Joi.string().required(),
		state: Joi.string().required(),
	});
	const { error } = schema.validate(body);
	if (error) throw { reason: new Error(error.details[0].message), message: error.details[0].message, httpCode: 400 };
}

module.exports = { register };
