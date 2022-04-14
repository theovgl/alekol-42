const express = require('express');
const supabase = require('../../../utils/supabase.js');

module.exports = () => {

	const route = express.Router();

	route.delete('/:state', async (req, res) => {
		const { state } = req.params;
		try {
			await supabase.deleteState(state);
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				message: 'An unexpected error occured...',
				details: 'Please contact an administrator.',
			});
		}
		return res.sendStatus(204);
	});

	return route;

};
