const fetchById = require('./database/fetchById');

async function compareOnLog(user_id) {
	const data = await fetchById(user_id);
	return (data[0]);
}

module.exports = compareOnLog;
