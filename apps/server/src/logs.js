function logAction(fct, str) {
	fct(`${new Date().toISOString().padEnd(33, ' ')} | ${str}`);
}

function logUserAction(fct, ft_login, str) {
	fct(`${new Date().toISOString()} ${ft_login.padStart(8, ' ')} | ${str}`);
}

module.exports = { logAction, logUserAction };
