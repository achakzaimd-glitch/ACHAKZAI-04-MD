const os = require('os');
const settings = require('../settings.js');

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: '⚡ *𝗖𝗵𝗲𝗰𝗸𝗶𝗻𝗴...*' }, { quoted: message });
        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const botInfo = `

 🏓 𝗣𝗢𝗡𝗚 : ${ping}𝗺𝘀 `;

        await sock.sendMessage(chatId, { text: botInfo }, { quoted: message });

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: '❌ 𝗦𝗼𝗿𝗿𝘆, 𝘀𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝘄𝗲𝗻𝘁 𝘄𝗿𝗼𝗻𝗴!' });
    }
}

module.exports = pingCommand;