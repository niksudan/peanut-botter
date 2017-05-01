const Fuse = require('fuse.js');
const random = require('random-item');
const heroes = require('./heroes.json');

require('dotenv').config();

class Bot {
  constructor(client) {
    this.client = client;
		this.onMessage();
		this.onNewUser();
  }
	
	// ===========================================================================
	// LISTENERS
	// ===========================================================================
	
	/**
	 * Listen for mentions
	 */
	onMessage() {
		this.client.on('message', (message) => {
		  const user = message.author;
		  const channel = message.channel;
		  const mentions = message.mentions.users;
		  if (!user.bot && this.isChannelValid(channel.name) && this.isMentioned(mentions)) {
				try {
		      this.help(message);
		      this.assignHero(message);
				} catch (err) {
					message.reply(`Sorry, I screwed up\n\`\`\`${String(err)}\n\`\`\``);
				}
		  }
		});
	}

	/**
	 * Listen for new users joining the server
	 */
	onNewUser() {
		this.client.on('guildMemberAdd', (member) => {
			const user = member.user;
			const channel = member.guild.defaultChannel;
			if (!user.bot) {
				channel.send(`Welcome to the server, <@${user.id}>!`);
			}
		});
	}
	
	// ===========================================================================
	// COMMANDS
	// ===========================================================================

  /**
   * Provide help to users
   * Command: help
   */
  help(message) {
    const helpRegex = new RegExp(/(?:^<.+> )(help)$/gi);
    const result = helpRegex.exec(message.content);
    if (result && result[1]) {
      message.reply('' +
        'Did someone say... **Peanut Botter?**\n' +
        '- `role/hero <name>` - Assign a hero role to your name\n' +
        '- `help` - View commands'
      );
    }
  }

  /**
   * Assign a hero role to the user if requested
   * Command: role/hero <name>
   */
  assignHero(message) {
    const roleRegex = new RegExp(/(?:^<.+> )(?:role|hero) (.+)/gi);
    const result = roleRegex.exec(message.content);
    if (result && result[1]) {
      const hero = this.parseHero(result[1]);
      if (hero) {

        // Determine roles to remove and role to add
        let rolesToRemove = [];
        heroes.forEach((h) => {
          if (message.member.roles.find('name', h.name)) {
            const role = message.guild.roles.find('name', h.name);
            if (role) {
              rolesToRemove.push(role);
            }
          }
        });
        console.log(`Detected hero "${hero.name}" to assign and ${rolesToRemove.length} role(s) to remove`);

        // Trigger adding of role once other roles have been removed
        const addRole = (member) => {
          const role = message.guild.roles.find('name', hero.name);
          if (role) {
            member.addRole(role).then(() => {
              message.reply(random([
                `Congratulations, you're now ${hero.name}!`,
                `I've branded you as a ${hero.name} main!`,
                `From now on people will see you as a ${hero.name}!`,
                `As if we needed another ${hero.name}... Oh well!`,
                `Fine fine... I gave you the ${hero.name} role!`,
                `Wow, ${hero.name}... really? Could have picked someone else?`,
                `Wait, you can actually play ${hero.name}?`,
                `${hero.name}, huh? Can you play anything else?`,
                `I've always been fond of ${hero.name}... There you go!`,
              ]));
            }).catch((err) => {
              message.reply('Couldn\'t set your role, sorry');
              console.log(`Error setting role: ${String(err)}`);
            })
          } else {
            message.reply('Couldn\'t find your role, sorry');
          }
        };

        // Remove roles if necessary
        if (rolesToRemove.length > 0) {
          message.member.removeRoles(rolesToRemove).then((member) => {
            addRole(member);
          }).catch((err) => {
            message.reply('Couldn\'t clear your roles, sorry');
            console.log(`Error clearing roles: ${String(err)}`);
          });
        } else {
          addRole(message.member);
        }

      // Problem detecting which hero was chosen
      } else {
        message.reply(random([
          `Come again?`,
          `Is that a hero yet?`,
          `I don't think you said a hero there`,
          `I couldn't tell what you were trying to say, sorry`,
          `I'm sorry, what?`,
        ]));
      }
    }
  }
	
	// ===========================================================================
	// HELPERS
	// ===========================================================================
	
	/**
	 * Determine if a channel is valid for posting in
	 * @param {String} channel
	 * @return {Boolean}
	 */
	isChannelValid(name) {
		// I only listen to #peanut-botter if my environment is set to development
		return ((process.env.ENVIRONMENT !== 'development' && name !== 'peanut-botter') ||
			(process.env.ENVIRONMENT === 'development' && name === 'peanut-botter'));
	}
	
	/**
	 * Determine if the bot has been mentioned
	 * @param {Collection} mentions
	 * @return {Boolean}
	 */
	isMentioned(mentions) {
		return (mentions.array().length > 0 && mentions.find('username', 'peanut-botter'));
	}

  /**
   * Parse an Overwatch hero from text
   * @param {String} text
   * @return {Object}
   */
  parseHero(text) {
    const output = new Fuse(heroes, { keys: ['name'] }).search(text);
    if (output.length > 0) {
      return output[0];
    }
    return false;
  }
}

module.exports = Bot;
