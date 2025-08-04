const express = require('express');
const fs = require('fs-extra');
const { exec } = require("child_process");
let router = express.Router();
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const MESSAGE = process.env.MESSAGE || `
*🎉 SESSION GENERATED SUCCESSFULLY! ✅*

*💪 Empowering Your Experience with BLADE-XMD Bot*

*🌟 Show your support by giving our repo a star! 🌟*
🔗 https://github.com/Thugkeedxxx/BLADE-XMD-V1

*💭 Need help? Join our support groups:*
📢 💬
https://whatsapp.com/channel/0029VbB7a9v6LwHqDUERef0M

*📚 Learn & Explore More with Tutorials:*
🪄 YouTube Channel https://www.youtube.com/@thugkeed_sa

* ➪ Powered by 𝘛𝘏𝘜𝘎𝘒𝘌𝘌𝘋 𝘛𝘌𝘊𝘏🍁*
*Together, we build the future of automation! 🚀*

_________________________________________________

Use your Session ID Above to Deploy your Bot.
Check on YouTube Channel for Deployment Procedure(Ensure you have Github Account and Billed Heroku Account First.)
Don't Forget To Give Star⭐ To My Repo`;

const uploadToPastebin = require('./Paste');  // Assuming you have a function to upload to Pastebin
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");

// Ensure the directory is empty when the app starts
if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(`./auth_info_baileys`);
        try {
            let Smd = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });
      Smd.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect, qr } = s;

        if (qr) {
          // Ensure the response is only sent once
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'image/png');
            try {
              const qrBuffer = (await toBuffer(qr));  // Convert QR to buffer
              res.end(qrBuffer);  // Send the buffer as the response
              return; // Exit the function to avoid sending further responses
            } catch (error) {
              console.error("Error generating QR Code buffer:", error);
              return; // Exit after sending the error response
            }
          }
        }

        if (connection === "open") {
          await delay(3000);
          let user = Smd.user.id;

          //===========================================================================================
          //===============================  SESSION ID    ===========================================
          //===========================================================================================

          const auth_path = './auth_info_baileys/';
          const credsFilePath = auth_path + 'creds.json';

          // Upload the creds.json file to Pastebin directly
          const pastebinUrl = await uploadToPastebin(credsFilePath, 'creds.json', 'json', '1');
          
          const Scan_Id = pastebinUrl;  // Use the returned Pastebin URL directly

          console.log(`
====================  SESSION ID  ==========================
SESSION-ID ==> ${Scan_Id}
-------------------   SESSION CLOSED   -----------------------
`);

          let msgsss = await Smd.sendMessage(user, { text: Scan_Id });
          await Smd.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
          await delay(1000);

          try {
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
          } catch (e) {
            console.error('Error clearing directory:', e);
          }
        }

        Smd.ev.on('creds.update', saveCreds);

        if (connection === "close") {
          let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
          // Handle disconnection reasons
          if (reason === DisconnectReason.connectionClosed) {
            console.log("Connection closed!");
          } else if (reason === DisconnectReason.connectionLost) {
            console.log("Connection Lost from Server!");
          } else if (reason === DisconnectReason.restartRequired) {
            console.log("Restart Required, Restarting...");
            SUHAIL().catch(err => console.log(err));
          } else if (reason === DisconnectReason.timedOut) {
            console.log("Connection TimedOut!");
          } else {
            console.log('Connection closed with bot. Please run again.');
            console.log(reason);
            await delay(5000);
            exec('pm2 restart qasim');
            process.exit(0);
          }
        }
      });

    } catch (err) {
      console.log(err);
      exec('pm2 restart qasim');
      await fs.emptyDirSync(__dirname + '/auth_info_baileys');
    }
  }

  SUHAIL().catch(async (err) => {
    console.log(err);
    await fs.emptyDirSync(__dirname + '/auth_info_baileys');
    exec('pm2 restart qasim');
  });

  return await SUHAIL();
});

module.exports = router;
