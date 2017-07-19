const Fuse = require('fuse.js');
const random = require('random-item');
const got = require('got');
const moment = require('moment');
const Entities = require('html-entities').XmlEntities;
const heroes = require('./heroes.json');

require('dotenv').config();
const entities = new Entities();

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
          this.getNews(message);
          this.getHighlight(message);
          this.getFunny(message);
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
   * @param {Object} message
   */
  help(message) {
    const helpRegex = new RegExp(/(?:^<.+> +)(help)$/gi);
    const result = helpRegex.exec(message.content);
    if (result && result[1]) {
      message.reply('' +
        'Did someone say... **Peanut Botter?**\n' +
        '- `role/hero <name>` - Assign a hero role to your name\n' +
        '- `news` - Posts a discussion from the Overwatch subreddit\n' +
        '- `highlight` - Posts a popular highlight\n' +
        '- `funny` - Posts something funny\n' +
        '- `help` - Get a list of commands'
      );
    }
  }

  /**
   * Assign a hero role to the user if requested
   * @param {Object} message
   */
  assignHero(message) {
    const roleRegex = new RegExp(/(?:^<.+> +)(?:role|hero) (.+)/gi);
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

  /**
   * Get a relevant news/discussion post
   * @param {Object} message
   */
  getNews(message) {
    const newsRegex = new RegExp(/(?:^<.+> +)(news)$/gi);
    const result = newsRegex.exec(message.content);
    if (result && result[1]) {
      this.fetchPost('News & Discussion').then((post) => {
        message.reply(':newspaper: ' + random([
          'Have you read this yet?',
          'This is pretty popular right now',
          'A lot of people are talking about this',
          'Take a look at this piece of news',
          'Read all about it!',
          'Extra extra!',
          'You wouldn\'t believe what\'s trending right now',
          'I can assure you this is not fake news',
          'You might want to add this to your reading list',
          'Lots of words here! Save it for a rainy day?',
        ]));
        message.channel.send('' +
          `**${post.title}**\n` +
          `Posted ${post.posted}\n` +
          `${post.url}`
        );
      }).catch((code) => {
        switch (code) {
          case 0:
            message.reply('Sorry, but I couldn\'t connect to Reddit...');
            break;
          case 1:
            message.reply('Sorry, but no one\'s posting any news! Boring day, I suppose.');
            break;
        }
      });
    }
  }

  /**
   * Get a relevant highlight
   * @param {Object} message
   */
  getHighlight(message) {
    const newsRegex = new RegExp(/(?:^<.+> +)(highlight)$/gi);
    const result = newsRegex.exec(message.content);
    if (result && result[1]) {
      this.fetchPost('Highlight').then((post) => {
        message.reply(':projector: ' + random([
          'Have you seen this yet?',
          'This is pretty popular right now',
          'A lot of people are marvelling about this',
          'Take a look at this highlight',
          'Bask in this epic highlight!',
          'One day you\'ll get a highlight like this',
          'This isn\'t anything special...',
          'I pulled this off the other day, I just forgot to record it... I swear!',
          'People are obsessing over this highlight right now',
          'Check out this skill!',
        ]));
        message.channel.send('' +
          `**${post.title}**\n` +
          `Posted ${post.posted}\n` +
          `${post.url}`
        );
      }).catch((code) => {
        switch (code) {
          case 0:
            message.reply('Sorry, but I couldn\'t connect to Reddit...');
            break;
          case 1:
            message.reply('Sorry, but no one\'s posting any highlights! I guess no one has any skill.');
            break;
        }
      });
    }
  }

  /**
   * Get a relevant humour post
   * @param {Object} message
   */
  getFunny(message) {
    const newsRegex = new RegExp(/(?:^<.+> +)(funny)$/gi);
    const result = newsRegex.exec(message.content);
    if (result && result[1]) {
      this.fetchPost('Humor').then((post) => {
        message.reply(':joy: ' + random([
          'Have you laughed at this yet?',
          'This is pretty funny right now',
          'A lot of people are chuckling over this',
          'Take a look at this comedy!',
          'Try not to laugh at this one',
          'HAHA! Sorry, but this one is too good',
          'This isn\'t funny... OK, maybe it is a little',
          'I hear this post could make even Reaper laugh!',
          'This is some gold right here',
          'Brace yourself for this one!',
        ]));
        message.channel.send('' +
          `**${post.title}**\n` +
          `Posted ${post.posted}\n` +
          `${post.url}`
        );
      }).catch((code) => {
        switch (code) {
          case 0:
            message.reply('Sorry, but I couldn\'t connect to Reddit...');
            break;
          case 1:
            message.reply('Sorry, but no one\'s posting anything funny! Serious day, I presume.');
            break;
        }
      });
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

  /**
   * Get a post from r/Overwatch
   * @param {String|Boolean} filter
   * @param {Number} limit
   * @param {String} period
   * @return {Promise<Object>}
   */
  fetchPost(filter = false, limit = 50, period = 'week') {
    return new Promise((resolve, reject) => {
      const posts = [];
      got(`https://www.reddit.com/r/Overwatch/top.json?sort=top&t=${period}&limit=${limit}`).then((response) => {
        JSON.parse(response.body).data.children.forEach((post) => {
          const postFilter = entities.decode(post.data.link_flair_text);
          if (!post.data.stickied && (!filter || filter === postFilter)) {
            posts.push({
              title: entities.decode(post.data.title),
              type: postFilter,
              posted: moment.unix(post.data.created_utc).fromNow(),
              url: post.data.url,
            });
          }
        });
        if (posts.length > 0) {
          resolve(random(posts));
        } else {
          reject(1);
        }
      }).catch((err) => {
        reject(0);
      });
    });
  }
}

module.exports = Bot;
