# Alekol - Discord bot

Alekol is a Discord bot to automatically add or remove a role whether you are logged at 42 school.

![image](https://user-images.githubusercontent.com/76964081/163008574-42fdb83b-082a-4c3f-9572-27dbb4ad9842.png)

[Invite in your server](https://example.org)

## Usage

The bot is straightforward : it adds a role when you come at school, and removes it when you leave.

You can interact with it using a bunch of commands.

### `/auth`

This command is used to authenticate yourself with the bot. You will be able to either register or unregister.

> If you call this command in private messages, you will be able to unregister from all the guilds you are in.

### `/ping`

Pong.

### `/role`

This command allows you to change the handled role (the role being added or removed by the bot).

> It is reserved for admins or users with the Manage server permission.
> The role needs to exist, and both the user and the bots must have rights over it (otherwise it won't even appear in the list).

### `/spy login`

This command returns the location of the user with the matching login.

> You need to be registered to the bot in at least one server or in private messages.

## Installation

If you don't want to invite the official bot in your server, you can host your own instance.

You will need NodeJS v16 minimum, a Supabase database, a 42 client and a Discord client.

### Setup Supabase

The database needs three tables:

**guilds**:
|	name	|	type	| default value			| primary	|	is unique	|	is nullable	|
|-----------|-----------|-----------------------|-----------|---------------|---------------|
|	uuid	|	uuid	|	uuid_generate_v4()	|	yes		|	-			|	-			|
|	id		|	text	|	-					|	no		|	yes			|	no			|
|	name	|	text	|	-					|	no		|	no			|	no			|
|	role	|	text	|	-					|	no		|	no			|	yes			|

**state**:
|	name		|	type				| default value			| primary	|	is unique	|	is nullable	|
|---------------|-----------------------|-----------------------|-----------|---------------|---------------|
|	uuid		|	uuid				|	uuid_generate_v4()	|	yes		|	-			|	-			|
|	state		|	text				|	-					|	no		|	no			|	no			|
|	guild_id	|	link to guilds.id	|	-					|	no		|	no			|	no			|
|	ft_login	|	text				|	-					|	no		|	no			|	yes			|

**users**:
|	name		|	type				| default value			| primary	|	is unique	|	is nullable	|
|---------------|-----------------------|-----------------------|-----------|---------------|---------------|
|	uuid		|	uuid				|	uuid_generate_v4()	|	yes		|	-			|	-			|
|	discord_id	|	text				|	-					|	no		|	no			|	no			|
|	ft_login	|	text				|	-					|	no		|	no			|	no			|
|	guild_id	|	link to guilds.id	|	-					|	no		|	no			|	no			|

### Setup 42 client

The only setting that is important, is the redirect URI field. You need to write the actual URL of your host.

For example, let's say you own `myapp.com`, you would have to write `https://myapp.com/register` (the `/register` is important too).

### Setup Discord client

Like the 42 client setup, you have to add a redirect URI (`OAuth2 -> General -> Redirect`).

Let's say you own `myapp.com`, you would have to write `https://myapp.com/register` (the `/register` is important too).

In `OAuth2 -> URL Generator`, you can generate an invite link for your bot. The required scopes are `bot` and `application.commands`, and the required bot permissions are `Manage Roles` and `Send Messages`.

Finally, you need to enable the `Server Members Intent` in `Bot`.

### .env

Here are the variables required in the `.env` file.

(In `apps/server`)
```
DISCORD_TOKEN=			< The Discord bot token >
DISCORD_CLIENT_ID=		< The Discord client ID >
DISCORD_CLIENT_SECRET=	< The Discord client secret >
DISCORD_GUILD_ID=		< The Discord guild where you will develop the bot (not required) >

SUPABASE_URL=			< The Supabase API URL >
SUPABASE_ANON_KEY=		< The Supabase API anon key >

UID_42=					< The 42 client UID >
SECRET_42=				< The 42 client secret >
FT_CABLE_USER_ID=		< The 42 user.id cookie >

FT_USER_ID=				< The 42 user_id >
REDIRECT_URI=			< The redirect URI that you have set in 42 API and Discord >
```

#### How do I find the 42 `user.id` cookie and `user_id`?

Go to `https://meta.intra.42.fr/clusters` with your web browser and go into Network tab. Select the websocket `/cable` request.

- `FT_CABLE_USER_ID`: `Response tab -> [select any sent message] -> user_id`. It should look like 12345.
- `FT_USER_ID`: `Cookies tab -> user.id`.
