const settings = require("../settings");

async function aliveCommand(sock, chatId, message) {
    try {
        const message1 = `✨ *ACHAKZAI 04 MD* ✨
*┏━━━━━━━━━━━━━━━━❥❥❥*
*┃*  🟢 𝙏𝙝𝙚 𝙗𝙤𝙩 𝙞𝙨 𝙖𝙡𝙞𝙫𝙚         
*┃* 𝙖𝙣𝙙 𝙧𝙪𝙣𝙣𝙞𝙣𝙜 𝙨𝙢𝙤𝙤𝙩𝙝𝙡𝙮              *┗━━━━━━━━━━━━━━━━❥❥❥*
*┃* 📦 v${settings.version}       
*┃* 🎯 ONLINE • PUBLIC         
*┃* ⏱️ ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m uptime         
*┗━━━━━━━━━━━━━━━━❥❥❥*

🌟 *FEATURES*
📥 • 👥 • 🛡️ • 🎮 • 🤖 • 🎨

💡 *.menu* for commands list
✨ *Powered by Achakzai 04*`;

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363423640651952@newsletter',
                    newsletterName: 'Achakzai 04 MD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { 
            text: `✨ *ACHAKZAI 04 MD*\n\n𝙏𝙝𝙚 𝙗𝙤𝙩 𝙞𝙨 𝙖𝙡𝙞𝙫𝙚 𝙖𝙣𝙙 𝙧𝙪𝙣𝙣𝙞𝙣𝙜 𝙨𝙢𝙤𝙤𝙩𝙝𝙡𝙮\n\n📌 Type .menu` 
        }, { quoted: message });
    }
}

module.exports = aliveCommand;