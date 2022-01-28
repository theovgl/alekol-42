const { supabaseClient } = require('../../utils/supabaseClient.js')

async function fetchById(user_id) {
	const { data, error } = await supabaseClient
		.from('users')
		.select('*')
		.match({ ft_id: user_id })
	if (error) throw (error);
	else return (data)
}

module.exports = fetchById;
