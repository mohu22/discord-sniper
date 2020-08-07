const { Client } = require('discord.js');
const dotenv = require('dotenv');
const request = require('request');

// Load env
dotenv.config({ path: '.env' });
const tokens = process.env.guildTokens.split(',');
const mainToken = process.env.mainToken;
const webhookUrl = process.env.webhookUrl;
const mention = process.env.mention || '';

const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.307 Chrome/78.0.3904.130 Electron/7.3.2 Safari/537.36';

let invalidCode = [];

for (const token of tokens) {
  const client = new Client({
    disabledEvents: [
      'GUILD_UPDATE',
      'GUILD_MEMBER_ADD',
      'GUILD_MEMBER_REMOVE',
      'GUILD_MEMBER_UPDATE',
      'GUILD_MEMBERS_CHUNK',
      'GUILD_ROLE_CREATE',
      'GUILD_ROLE_DELETE',
      'GUILD_ROLE_UPDATE',
      'GUILD_BAN_ADD',
      'GUILD_BAN_REMOVE',
      'CHANNEL_CREATE',
      'CHANNEL_DELETE',
      'CHANNEL_UPDATE',
      'CHANNEL_PINS_UPDATE',
      'MESSAGE_DELETE',
      'MESSAGE_UPDATE',
      'MESSAGE_DELETE_BULK',
      'MESSAGE_REACTION_ADD',
      'MESSAGE_REACTION_REMOVE',
      'MESSAGE_REACTION_REMOVE_ALL',
      'USER_UPDATE',
      'USER_NOTE_UPDATE',
      'USER_SETTINGS_UPDATE',
      'PRESENCE_UPDATE',
      'VOICE_STATE_UPDATE',
      'TYPING_START',
      'VOICE_SERVER_UPDATE',
      'RELATIONSHIP_ADD',
      'RELATIONSHIP_REMOVE',
    ],
  });

  client.on('message', async (msg) => {
    // nitroURL
    let code = msg.content.match(/discord\.gift\/[^\s]+/gim);

    if (code !== null && code.length >= 0) {
      const startTime = Date.now();
      for (let i = 0; i < code.length; i++) {
        // コード文字列取得
        let c = code[i].replace('discord.gift/', '');

        // discordに投稿するメッセージ
        let messageText;

        // 16桁以外・無効コードはスキップ
        /* --------------------------- ❌Skip Invalid Code --------------------------- */
        if (c.length !== 16 || invalidCode.includes(c)) {
          const endTime = Date.now();
          const elapsedTime = (endTime - startTime) / 1000;
          messageText = `❌Skip Invalid Code (${c}) - ${sourceFrom} - ${msg.author.tag} [${elapsedTime}sec]`;
          console.log(messageText);
          postMessage(messageText);
          invalidCode.push(c);
          continue;
        }

        /* --------------------------------- redeem --------------------------------- */
        request.post(
          `https://discord.com/api/v6/entitlements/gift-codes/${c}/redeem`,
          {
            headers: {
              authorization: mainToken,
              'User-Agent': userAgent,
            },
          },
          (err, res, b) => {
            let body = JSON.parse(b);
            let sourceFrom = msg.guild ? msg.guild.name : 'DMs';
            const endTime = Date.now();
            const elapsedTime = (endTime - startTime) / 1000;
            /* --------------------------- Unauthorized ERROR --------------------------- */
            if (body.message === '401: Unauthorized') {
              messageText = `[Nitro Sniper] (${c}) - Error - Your main token is invalid.`;

              /* ---------------------------- ❌Already redeemed --------------------------- */
            } else if (body.message == 'This gift has been redeemed already.') {
              messageText = `❌Already redeemed (${c}) - ${sourceFrom} - ${msg.author.tag} [${elapsedTime}sec]`;
              postMessage(messageText);
              invalidCode.push(c);

              /* ------------------------ 🎉SUCCESS! Nitro Redeemed ----------------------- */
            } else if ('subscription_plan' in body) {
              messageText = `${mention} 🎉SUCCESS! Nitro Redeemed (${c}) - ${sourceFrom} - ${msg.author.tag} [${elapsedTime}sec]`;
              postMessage(messageText);

              /* ------------------------------ ❌Invalid Code ----------------------------- */
            } else if (body.message == 'Unknown Gift Code') {
              messageText = `❌Invalid Code (${c}) - ${sourceFrom} - ${msg.author.tag} [${elapsedTime}sec]`;
              postMessage(messageText);
              invalidCode.push(c);

              /* ---------------------------- Unknown Response ---------------------------- */
            } else {
              messageText = 'unknown response';
              postMessage(messageText);
            }
            console.log(messageText);
          }
        );
      }
    }
  });

  client.on('ready', () => {
    client.user.setStatus('invisible');
    console.log(`Logged in as ${client.user.tag}.`);
    postMessage(`Logged in as ${client.user.tag}.`);
  });

  setTimeout(() => {
    client.login(token);
  }, 1000);
}

async function postMessage(messageText) {
  request.post(
    {
      uri: webhookUrl,
      headers: { 'Content-type': 'application/json' },
      json: { content: messageText },
    },
    (error, response, body) => {}
  );
}
