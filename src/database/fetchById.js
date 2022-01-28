const { supabaseClient } = require('../../utils/supabaseClient.js')

async function fetchById(user_id) {
	const { data, error } = await supabaseClient
		.from('users')
		.select('*')
		.match({ ft_id: user_id })
	if (error) {
		console.log(`${error}\n${user_id} not in db`)
		return (null)
	} else return (data)
}

module.exports = fetchById;
