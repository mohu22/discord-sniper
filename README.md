# Nitro Sniper
Snipes nitro gift codes.

# Deploying to Heroku

To deploy to Heroku, you can click on the image below and login to your account.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/zzzmario/nitro-sniper-alt/tree/master)

**You can now go back to your app's page then visit *Resources*, make sure you disable the *web* dyno and enable the *worker* dyno. Your bot should now be up and running. Remember you can always check your bot's console if you access the *View Logs* in the *More* dropdown menu.**

# Requirements
- [Node](https://nodejs.org/en/)
- [Git](https://git-scm.com/downloads)

# Installation
- Open a command prompt (Win key + R and type `cmd`)
- Run `git clone https://github.com/hellbound1337/nitro-sniper-alt.git nitro-sniper-alt`
- Run `cd nitro-sniper-alt`
- Run `npm install`
- Run `node .`

# Features
- Logs into an alt accounts, making sure you don't have a cluttered discord with too many guilds on your main account, pass your `mainToken` and seperate your `guildTokens` with `,`. Example: `token1,token2`
- Multi-token support
- Low CPU Usage (Because of less guilds on your main account)
- Mobile Notifications ACTUALLY work (It doesn't log into ur main account which means notifications wont reroute to the nitro sniper and will instead work normally, mobile notifications won't work on your alts since they are logged in from the sniper.)
- Light (No cluttered code, very simple and efficient)
- One-click deploy

# Tips
- Hosting this on something with high bandwidth might benefit you.
- Do not mention that you have this anywhere , you have a high risk of being reported and possibly even terminated.
