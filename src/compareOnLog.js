const fetchById = require("./database/fetchById")

async function compareOnLog(user_id) {
	const data = await fetchById(user_id)

	if (data.length == 0) {
		return (null)
	} else {
		return (data[0])
	}
}

module.exports = compareOnLog
