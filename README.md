# peanut-botter [![Add to Discord](https://img.shields.io/badge/Add%20to-Discord-7289da.svg)](https://discordapp.com/oauth2/authorize?client_id=306417246165532682&scope=bot&permissions=0)

A Discord bot for Overwatch servers.

## Passive Features

The bot will automatically perform these.

### Welcoming

If any new user joins your server, peanut-botter will welcome them.

## Commands

Mention the bot with one of these commands for a response.

### Help

**Command**: `help`

Get a list of commands.

### Role Assign

**Command**: `role/hero <name`

**Prerequisite**: Give the bot permission to manage roles on your server, and add roles that mimic the names of the heroes found in [`src/heroes.json`](src/heroes.json).

When someone mentions the bot with the word "role" or "hero", then a hero name, it'll assign you the role automatically. (e.g. "@peanut-botter role hanzo").
