# Alekol - Discord bot

[![ESLint](https://github.com/theovgl/bot_alekol/actions/workflows/lint.yml/badge.svg)](https://github.com/theovgl/bot_alekol/actions/workflows/lint.yml)
[![Node.js CI](https://github.com/theovgl/bot_alekol/actions/workflows/node.yml/badge.svg?branch=main)](https://github.com/theovgl/bot_alekol/actions/workflows/node.yml)
[![Invite](https://img.shields.io/badge/Alekol-Invite-red?style=social&logo=discord)](https://discord.com/api/oauth2/authorize?client_id=935192175908651058&permissions=268437504&scope=applications.commands%20bot)

Alekol is a Discord bot to automatically add or remove a role whether you are logged at 42 school.

![image](https://user-images.githubusercontent.com/76964081/163008574-42fdb83b-082a-4c3f-9572-27dbb4ad9842.png)

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

Checkout the server's and site's README for installation procedures.

## Contributors

- [@tvogel](https://github.com/tvogel)
- [@vfurmane](https://github.com/vfurmane)
