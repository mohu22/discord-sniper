const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
const { Client } = require('discord.js');
const dotenv = require('dotenv')
const request = require('request')
dotenv.config({ path: '.env' })
const tokens = process.env.guildTokens.split(',')
const mainToken = process.env.mainToken;
const webhookUrl = process.env.webhookUrl;
const mention = process.env.mention || '';
let invalidCode = [];
for (const token of tokens) {
    const client = new Client({
        disabledEvents: [
            "GUILD_UPDATE",
            "GUILD_MEMBER_ADD",
            "GUILD_MEMBER_REMOVE",
            "GUILD_MEMBER_UPDATE",
            "GUILD_MEMBERS_CHUNK",
            "GUILD_ROLE_CREATE",
            "GUILD_ROLE_DELETE",
            "GUILD_ROLE_UPDATE",
            "GUILD_BAN_ADD",
            "GUILD_BAN_REMOVE",
            "CHANNEL_CREATE",
            "CHANNEL_DELETE",
            "CHANNEL_UPDATE",
            "CHANNEL_PINS_UPDATE",
            "MESSAGE_DELETE",
            "MESSAGE_UPDATE",
            "MESSAGE_DELETE_BULK",
            "MESSAGE_REACTION_ADD",
            "MESSAGE_REACTION_REMOVE",
            "MESSAGE_REACTION_REMOVE_ALL",
            "USER_UPDATE",
            "USER_NOTE_UPDATE",
            "USER_SETTINGS_UPDATE",
            "PRESENCE_UPDATE",
            "VOICE_STATE_UPDATE",
            "TYPING_START",
            "VOICE_SERVER_UPDATE",
            "RELATIONSHIP_ADD",
            "RELATIONSHIP_REMOVE",
        ]
    });

    client.on('message', async(msg) => {
        let code = msg.content.match(/discord\.gift\/[^\s]+/gmi);
        if (code !== null && code.length >= 0) {
            for (let i = 0; i < code.length; i++) {
                let c = code[i].replace('discord.gift/', '');
                if (!invalidCode.includes(c)) {
                    await request.post(`https://discord.com/api/v6/entitlements/gift-codes/${c}/redeem`, {
                        headers: { "authorization": mainToken, "User-Agent": userAgent }
                    }, (err, res, b) => {
                        let body = JSON.parse(b);
                        if (body.message === '401: Unauthorized') {
                            console.log(`[Nitro Sniper] (${c}) - Error - Your main token is invalid.`);
                        } else if (body.message == "This gift has been redeemed already.") {
                            console.log(`[Nitro Sniper] (${c}) - Already redeemed - ${msg.guild ? msg.guild.name : "DMs"} `);
                            request.post({ uri: webhookUrl, headers: { "Content-type": "application/json" }, json: { "content": `❌Already redeemed (${c}) - ${msg.guild ? msg.guild.name : "DMs"} - ${msg.author.tag}` } }, function(error, response, body) {});
                        } else if ('subscription_plan' in body) {
                            console.log(`[Nitro Sniper] (${c}) - SUCCESS! Nitro Redeemed - ${msg.guild ? msg.guild.name : "DMs"}`);
                            request.post({ uri: webhookUrl, headers: { "Content-type": "application/json" }, json: { "content": `${mention} 🎉SUCCESS! Nitro Redeemed (${c}) - ${msg.guild ? msg.guild.name : "DMs"} - ${msg.author.tag}` } }, function(error, response, body) {});
                            console.log(body.message);
                            request.post({ uri: webhookUrl, headers: { "Content-type": "application/json" }, json: { "content": body.message } }, function(error, response, body) {});

                        } else if (body.message == "Unknown Gift Code") {
                            console.log(`[Nitro Sniper] (${c}) - Invalid Code - ${msg.guild ? msg.guild.name : "DMs"}`)
                            request.post({ uri: webhookUrl, headers: { "Content-type": "application/json" }, json: { "content": `❌Invalid Code (${c}) - ${msg.guild ? msg.guild.name : "DMs"} - ${msg.author.tag}` } }, function(error, response, body) {});
                        }
                        invalidCode.push(c);
                    })
                } else {
                    console.log(`skip(${c})`);
                    request.post({ uri: webhookUrl, headers: { "Content-type": "application/json" }, json: { "content": `❌Skip Invalid Code (${c}) - ${msg.guild ? msg.guild.name : "DMs"} - ${msg.author.tag}` } }, function(error, response, body) {});
                }
            }
        }
    })

    client.on('ready', () => {
        client.user.setStatus("invisible")
        console.log(`[Nitro Sniper] Logged in as ${client.user.tag}.`)
        request.post({ uri: webhookUrl, headers: { "Content-type": "application/json" }, json: { "content": `[Nitro Sniper] Logged in as ${client.user.tag}.` } }, function(error, response, body) {});
    })

    setTimeout(() => {
        client.login(token)
    }, 1000)
}
