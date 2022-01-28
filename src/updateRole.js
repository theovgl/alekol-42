const client = require("../client");

const ROLE = 'alekol-user'

async function createRole(guild) {
	return (guild.roles.create({
		name: ROLE,
		color: 'YELLOW',
	}))
}

async function assignRole(memberRoles, to_add) {
	// la ca coince pour une histoire de permissions
	// vu que je suis l'administrateur du serveur le bot a pas suffisament de droit
	// donc il faudrait le passer admin (un peu bizarre)
	// si on le passe admin alors il faut changer le nom du role qu'on assigne au gens
	// parce que pour l'instant bot et user partage le meme role
	await memberRoles.add(to_add)
}

// C'est vraiment brouillon il y a surement tout un tas de conneries
// et c'est mal ecrit avec toutes ces const

// at_school c'est un nom de variable eclate pour dire si on doit ajouter ou enlever le role
async function updateRole(discord_id, user_guilds, at_school) {
	let newRole;

	// Pour l'instant il y a toujours ce wait moche
	const wait = require('util').promisify(setTimeout)
	await wait(500);

	// On recupere la guild
	const Guild = client.guilds.cache.get(user_guilds)
	if (Guild === undefined) throw (`The guild (${user_guilds}) associated with the user (${discord_id}) has not been found`);

	// On recup la liste des roles dans le serveur/guild
	const Roles = Guild.roles.cache.map(roles => roles.name)

	// On recup le membre a qui on veut ajouter le role
	let Member;
	try {
		Member = await Guild.members.fetch(discord_id);
	} catch (error) {
		throw (`The user (${discord_id}) has not been found in the guild (${user_guilds})`);
	}

	// Et pour finir on recup son role manager
	const MemberRoles = Member.roles

	// la je check si le role existe
	// si c'est pas le cas je le cree (c'est fonctionnel)
	// sinon je recup l'id de ce role

	// If we create the role, it can be too fast to check if
	// it already exists so the role will be created too many times
	try {
		newRole = Guild.roles.cache.find((r) => r.name === ROLE);
	} catch (error) {
		throw (`Could not find the role (${ROLE}) in the guild (${user_guilds})`);
	}
	assignRole(MemberRoles, newRole)
}

module.exports = updateRole;
