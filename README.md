# 42 Alekol

[![ESLint](https://github.com/theovgl/bot_alekol/actions/workflows/lint.yml/badge.svg)](https://github.com/theovgl/bot_alekol/actions/workflows/lint.yml)
[![Node.js CI](https://github.com/theovgl/bot_alekol/actions/workflows/node.yml/badge.svg?branch=main)](https://github.com/theovgl/bot_alekol/actions/workflows/node.yml)

A Discord bot to add a role on your guild's members whenever they are at 42 school.

## What I've used

- [Supabase](https://github.com/supabase/supabase)
- [DiscordJS](https://github.com/discordjs/discord.js)
- [Axios](https://github.com/axios/axios)
- [NodeJS](https://github.com/nodejs/node)

## Installation

Rename the `.env.template` file and fill in the fields with your credentials:

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=

SUPABASE_URL=
SUPABASE_ANON_KEY=

UID_42=
SECRET_42=

FT_USER_ID=
FT_SESSION=
REDIRECT_URI=
```

Install node packages and run the program:

```sh
npm i
npm start
```
