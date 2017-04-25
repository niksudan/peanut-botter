const Fuse = require('fuse.js');
const random = require('random-item');
const heroes = require('./heroes.json');

class Bot {
  constructor(message) {
    this.message = message;
    try {
      this.help();
      this.assignHero();
    } catch (err) {
      this.message.reply(`Sorry, I screwed up\n\`\`\`${String(err)}\n\`\`\``);
    }
  }

  /**
   * Provide help to users
   * Command: help
   */
  help() {
    const helpRegex = new RegExp(/(?:^<.+> )(help)$/gi);
    const result = helpRegex.exec(this.message.content);
    if (result && result[1]) {
      this.message.reply('' +
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
  assignHero() {
    const roleRegex = new RegExp(/(?:^<.+> )(?:role|hero) (.+)/gi);
    const result = roleRegex.exec(this.message.content);
    if (result && result[1]) {
      const hero = this.parseHero(result[1]);
      if (hero) {

        // Determine roles to remove and role to add
        let rolesToRemove = [];
        heroes.forEach((h) => {
          if (this.message.member.roles.find('name', h.name)) {
            const role = this.message.guild.roles.find('name', h.name);
            if (role) {
              rolesToRemove.push(role);
            }
          }
        });
        console.log(`Detected hero "${hero.name}" to assign and ${rolesToRemove.length} role(s) to remove`);

        // Trigger adding of role once other roles have been removed
        const addRole = (member) => {
          const role = this.message.guild.roles.find('name', hero.name);
          if (role) {
            member.addRole(role).then(() => {
              this.message.reply(random([
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
              this.message.reply('Couldn\'t set your role, sorry');
              console.log(`Error setting role: ${String(err)}`);
            })
          } else {
            this.message.reply('Couldn\'t find your role, sorry');
          }
        };

        // Remove roles if necessary
        if (rolesToRemove.length > 0) {
          this.message.member.removeRoles(rolesToRemove).then((member) => {
            addRole(member);
          }).catch((err) => {
            this.message.reply('Couldn\'t clear your roles, sorry');
            console.log(`Error clearing roles: ${String(err)}`);
          });
        } else {
          addRole(this.message.member);
        }

      // Problem detecting which hero was chosen
      } else {
        this.message.reply(random([
          `Come again?`,
          `Is that a hero yet?`,
          `I don't think you said a hero there`,
          `I couldn't tell what you were trying to say, sorry`,
          `I'm sorry, what?`,
        ]));
      }
    }
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
