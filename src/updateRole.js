const ROLE = 'alekol-user';

async function assignRole(memberRoles, to_add) {
	await memberRoles.add(to_add);
}

async function removeRole(memberRoles, to_remove) {
	await memberRoles.remove(to_remove);
}

async function updateRole(client, discord_id, user_guilds, is_at_school) {
	let newRole;

	// To delete
	const wait = require('util').promisify(setTimeout);
	await wait(500);

	const guild = client.guilds.cache.get(user_guilds);
	if (guild === undefined) throw (`The guild (${user_guilds}) associated with the user (${discord_id}) has not been found`);

	let member;
	try {
		member = await guild.members.fetch(discord_id);
	}
	catch (error) {
		throw (`The user (${discord_id}) has not been found in the guild (${user_guilds})`);
	}

	// If we create the role, it can be too fast to check if
	// it already exists so the role will be created too many times
	const memberRoles = member.roles;
	try {
		newRole = guild.roles.cache.find((r) => r.name === ROLE);
	}
	catch (error) {
		throw (`Could not find the role (${ROLE}) in the guild (${user_guilds})`);
	}
	if (!newRole) throw (`Could not find the role (${ROLE}) in the guild (${user_guilds})`);
	if (is_at_school) assignRole(memberRoles, newRole);
	else if (!is_at_school) removeRole(memberRoles, newRole);
}

module.exports = updateRole;
