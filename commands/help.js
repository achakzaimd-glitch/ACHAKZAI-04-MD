const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    // Store menu session
    if (!global.menuSessions) global.menuSessions = new Map();
    global.menuSessions.set(chatId, { timestamp: Date.now() });
    
    const helpMessage = `
*┏━━━━━━━━━━━━━━━━━━━❥❥❥*
*┃* *👾 ${settings.botName || '𝘼𝘾𝙃𝘼𝙆𝙕𝘼𝙄-04-𝙈𝘿'}*  
*┃*  Version: *${settings.version || '3.0.0'}*
   by ${settings.botOwner || '𝘼𝘾𝙃𝘼𝙆𝙕𝘼𝙄 04'}
*┃*
*┗━━━━━━━━━━━━━━━━━━━❥❥❥*

*┏━━━━━━━━━━━━━❥❥❥*
*┃**📜 SELECT CATEGORY*:
*┃**Reply with number*:
*┗━━━━━━━━━━━━━❥❥❥*

*1️⃣* *General Commands*
*2️⃣* *Admin Commands*
*3️⃣* *Owner Commands*
*4️⃣* *Image/Sticker Commands*
*5️⃣* *AI Commands*
*6️⃣* *Downloader Commands*
*7️⃣* *Full Menu*

*┏━━━━━━━━━━━━━━━━━━━❥❥❥*
*┃* *𝕡𝕠𝕨𝕖𝕣𝕖𝕕 𝙱𝚢 𝙰𝚌𝚑𝚊𝚔𝚣𝚊𝚒 04
*┗━━━━━━━━━━━━━━━━━━━❥❥❥*

Join our channel for updates:`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363423640651952@newsletter',
                        newsletterName: 'Achakzai 04 MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363423640651952@newsletter',
                        newsletterName: 'Achakzai 04 MD',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

// Handle menu selection
async function handleMenuSelection(sock, message, chatId) {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    const selection = parseInt(text);
    
    if (isNaN(selection) || selection < 1 || selection > 7) return false;
    
    const menuSessions = global.menuSessions;
    if (!menuSessions?.has(chatId)) return false;
    
    menuSessions.delete(chatId);
    
    let menuText = '';
    
    switch(selection) {
        case 1: // General Commands
            menuText = `
*┏━━━━━━━━━━━━━❥❥❥*
*┃**𝙂𝙚𝙣𝙚𝙧𝙖𝙡 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨*:
*┗━━━━━━━━━━━━━❥❥❥*
*┃*  .𝐡𝐞𝐥𝐩 or .𝐦𝐞𝐧𝐮
*┃*  .𝐩𝐢𝐧𝐠
*┃*  .𝐚𝐥𝐢𝐯𝐞
*┃*  .𝐭𝐭𝐬 
*┃*  .𝐨𝐰𝐧𝐞𝐫
*┃*  .𝐟𝐚𝐜𝐭
*┃*  .𝐰𝐞𝐚𝐭𝐡𝐞𝐫 
*┃*  .𝐧𝐞𝐰𝐬
*┃*  .𝐚𝐭𝐭𝐩 
*┃*  .𝐥𝐲𝐫𝐢𝐜𝐬 
*┃*  .𝐠𝐫𝐨𝐮𝐩𝐢𝐧𝐟𝐨
*┃*  .𝐬𝐭𝐚𝐟𝐟 or .𝐚𝐝𝐦𝐢𝐧𝐬 
*┃*  .𝐯𝐯
*┃*  .𝐭𝐫𝐲 
*┃*  .𝐬𝐬 
*┃*  .𝐣𝐢𝐝
*┃*  .𝐮𝐫𝐥
*┗━━━━━━━━━━━━━❥❥❥*

*Reply .menu to see main menu*`;
            break;
            
        case 2: // Admin Commands
            menuText = `
*┏━━━━━━━━━━━━━❥❥❥*
*┃* *𝐀𝐝𝐦𝐢𝐧 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬*:
*┗━━━━━━━━━━━━━❥❥❥*
*┃* .𝐛𝐚𝐧 
*┃* .𝐩𝐫𝐨𝐦𝐨𝐭𝐞 
*┃* .𝐝𝐞𝐦𝐨𝐭𝐞 
*┃* .𝐦𝐮𝐭𝐞 
*┃* .𝐮𝐧𝐦𝐮𝐭𝐞
*┃* .𝐝𝐞𝐥𝐞𝐭𝐞 or .𝐝𝐞𝐥
*┃* .𝐤𝐢𝐜𝐤
*┃* .𝐰𝐚𝐫𝐧𝐢𝐧𝐠𝐬 
*┃* .𝐰𝐚𝐫𝐧 
*┃* .𝐚𝐧𝐭𝐢𝐥𝐢𝐧𝐤
*┃* .𝐚𝐧𝐭𝐢𝐛𝐚𝐝𝐰𝐨𝐫𝐝
*┃* .𝐜𝐥𝐞𝐚𝐫
*┃* .𝐭𝐚𝐠 
*┃* .𝐭𝐚𝐠𝐚𝐥𝐥
*┃* .𝐭𝐚𝐠𝐧𝐨𝐭𝐚𝐝𝐦𝐢𝐧
*┃* .𝐡𝐢𝐝𝐞𝐭𝐚𝐠
*┃* .𝐜𝐡𝐚𝐭𝐛𝐨𝐭
*┃* .𝐫𝐞𝐬𝐞𝐭𝐥𝐢𝐧𝐤
*┃* .𝐚𝐧𝐭𝐢𝐭𝐚𝐠 
*┃* .𝐰𝐞𝐥𝐜𝐨𝐦𝐞 
*┃* .𝐠𝐨𝐨𝐝𝐛𝐲𝐞
*┃* .𝐬𝐞𝐭𝐠𝐝𝐞𝐬𝐜 
*┃* .𝐬𝐞𝐭𝐠𝐧𝐚𝐦𝐞 
*┃* .𝐬𝐞𝐭𝐠𝐩𝐩 
*┗━━━━━━━━━━━━━❥❥❥*

*Reply .menu to see main menu*`;
            break;
            
        case 3: // Owner Commands
            menuText = `
*┏━━━━━━━━━━━━━❥❥❥*
*┃* *𝐎𝐰𝐧𝐞𝐫 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬*:
*┗━━━━━━━━━━━━━❥❥❥*
*┃* .𝐦𝐨𝐝𝐞 
*┃* .𝐜𝐥𝐞𝐚𝐫𝐬𝐞𝐬𝐬𝐢𝐨𝐧
*┃* .𝐚𝐧𝐭𝐢𝐝𝐞𝐥𝐞𝐭𝐞
*┃* .𝐜𝐥𝐞𝐚𝐫𝐭𝐦𝐩
*┃* .𝐮𝐩𝐝𝐚𝐭𝐞
*┃* .𝐬𝐞𝐭𝐭𝐢𝐧𝐠𝐬
*┃* .𝐬𝐞𝐭𝐩𝐩 
*┃* .𝐚𝐮𝐭𝐨𝐫𝐞𝐚𝐜𝐭 
*┃* .𝐚𝐮𝐭𝐨𝐬𝐭𝐚𝐭𝐮𝐬 
*┃* .𝐚𝐮𝐭𝐨𝐬𝐭𝐚𝐭𝐮𝐬 
*┃* .𝐚𝐮𝐭𝐨𝐭𝐲𝐩𝐢𝐧𝐠 
*┃* .𝐚𝐮𝐭𝐨𝐫𝐞𝐚𝐝
*┃* .𝐚𝐧𝐭𝐢𝐜𝐚𝐥𝐥
*┃* .𝐩𝐦𝐛𝐥𝐨𝐜𝐤𝐞𝐫 
*┃* .𝐩𝐦𝐛𝐥𝐨𝐜𝐤𝐞𝐫 
*┃* .𝐬𝐞𝐭𝐦𝐞𝐧𝐭𝐢𝐨𝐧 
*┃* .𝐦𝐞𝐧𝐭𝐢𝐨𝐧 
*┗━━━━━━━━━━━━━━━━❥❥❥*

*Reply .menu to see main menu*`;
            break;
            
        case 4: // Image/Sticker Commands
            menuText = `
*┏━━━━━━━━━━━━━━━━❥❥❥*
*┃* *𝐈𝐦𝐚𝐠𝐞/𝐒𝐭𝐢𝐜𝐤𝐞𝐫 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬*:
*┗━━━━━━━━━━━━━━━━❥❥❥*
*┃* .𝐛𝐥𝐮𝐫 
*┃* .𝐬𝐢𝐦𝐚𝐠𝐞 
*┃* .𝐬𝐭𝐢𝐜𝐤𝐞𝐫 
*┃* .𝐫𝐞𝐦𝐨𝐯𝐞𝐛𝐠
*┃* .𝐫𝐞𝐦𝐢𝐧𝐢
*┃* .𝐜𝐫𝐨𝐩 
*┗━━━━━━━━━━━━━━━━❥❥❥*

*Reply .menu to see main menu*`;
            break;
            
        case 5: // AI Commands
            menuText = `
*┏━━━━━━━━━━━━━━━━❥❥❥*
*┃*  *𝐀𝐈 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬*:
*┗━━━━━━━━━━━━━━━━❥❥❥*
*┃* .𝐠𝐩𝐭 
*┃* .𝐠𝐞𝐦𝐢𝐧𝐢 
*┃* .𝐢𝐦𝐚𝐠𝐢𝐧𝐞 
*┃* .𝐬𝐨𝐫𝐚 
*┗━━━━━━━━━━━━━━━━❥❥❥*

*Reply .menu to see main menu*`;
            break;
            
        case 6: // Downloader Commands
            menuText = `
*┏━━━━━━━━━━━━━❥❥❥*
*┃* *𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫*:
*┗━━━━━━━━━━━━━❥❥❥*
*┃* .𝐩𝐥𝐚𝐲 
*┃* .𝐬𝐨𝐧𝐠 
*┃* .𝐬𝐩𝐨𝐭𝐢𝐟𝐲
*┃* .𝐢𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦
*┃* .𝐟𝐚𝐜𝐞𝐛𝐨𝐨𝐤
*┃* .𝐭𝐢𝐤𝐭𝐨𝐤 
*┃* .𝐯𝐢𝐝𝐞𝐨 
*┃* .𝐲𝐭𝐦𝐩𝟒
*┗━━━━━━━━━━━━━❥❥❥*

*Reply .menu to see main menu*`;
            break;
            
        case 7: // Full Menu
            menuText = `
*┏━━━━━━━━━━━━━━━━━━━━━━❥❥❥*
*┃* *👾 ${settings.botName || '𝘼𝘾𝙃𝘼𝙆𝙕𝘼𝙄-04-𝙈𝘿'}*  
*┃*  Version: *${settings.version || '3.0.0'}*
   by ${settings.botOwner || '𝘼𝘾𝙃𝘼𝙆𝙕𝘼𝙄 04'}
*┃*
*┗━━━━━━━━━━━━━━━━━━━━━━━━❥❥❥*

*┏━━━━━━━━━━━━━❥❥❥*
*┃**𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐥𝐢𝐬𝐭 📜:*
*┗━━━━━━━━━━━━━❥❥❥*

*┏━━━━━━━━━━━━━❥❥❥*
*┃**𝙂𝙚𝙣𝙚𝙧𝙖𝙡 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙖*:
*┗━━━━━━━━━━━━━❥❥❥*
*┃*  .𝐡𝐞𝐥𝐩 or .𝐦𝐞𝐧𝐮
*┃*  .𝐩𝐢𝐧𝐠
*┃*  .𝐚𝐥𝐢𝐯𝐞
*┃*  .𝐭𝐭𝐬 
*┃*  .𝐨𝐰𝐧𝐞𝐫
*┃*  .𝐟𝐚𝐜𝐭
*┃*  .𝐰𝐞𝐚𝐭𝐡𝐞𝐫 
*┃*  .𝐧𝐞𝐰𝐬
*┃*  .𝐚𝐭𝐭𝐩 
*┃*  .𝐥𝐲𝐫𝐢𝐜𝐬 
*┃*  .𝐠𝐫𝐨𝐮𝐩𝐢𝐧𝐟𝐨
*┃*  .𝐬𝐭𝐚𝐟𝐟 or .𝐚𝐝𝐦𝐢𝐧𝐬 
*┃*  .𝐯𝐯
*┃*  .𝐭𝐫𝐲 
*┃*  .𝐬𝐬 
*┃*  .𝐣𝐢𝐝
*┃*  .𝐮𝐫𝐥
*┗━━━━━━━━━━━━━❥❥❥* 

*┏━━━━━━━━━━━━━❥❥❥*
*┃* *𝐀𝐝𝐦𝐢𝐧 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬*:
*┗━━━━━━━━━━━━━❥❥❥*
*┃* .𝐛𝐚𝐧 
*┃* .𝐩𝐫𝐨𝐦𝐨𝐭𝐞 
*┃* .𝐝𝐞𝐦𝐨𝐭𝐞 
*┃* .𝐦𝐮𝐭𝐞 
*┃* .𝐮𝐧𝐦𝐮𝐭𝐞
*┃* .𝐝𝐞𝐥𝐞𝐭𝐞 or .𝐝𝐞𝐥
*┃* .𝐤𝐢𝐜𝐤
*┃* .𝐰𝐚𝐫𝐧𝐢𝐧𝐠𝐬 
*┃* .𝐰𝐚𝐫𝐧 
*┃* .𝐚𝐧𝐭𝐢𝐥𝐢𝐧𝐤
*┃* .𝐚𝐧𝐭𝐢𝐛𝐚𝐝𝐰𝐨𝐫𝐝
*┃* .𝐜𝐥𝐞𝐚𝐫
*┃* .𝐭𝐚𝐠 
*┃* .𝐭𝐚𝐠𝐚𝐥𝐥
*┃* .𝐭𝐚𝐠𝐧𝐨𝐭𝐚𝐝𝐦𝐢𝐧
*┃* .𝐡𝐢𝐝𝐞𝐭𝐚𝐠
*┃* .𝐜𝐡𝐚𝐭𝐛𝐨𝐭
*┃* .𝐫𝐞𝐬𝐞𝐭𝐥𝐢𝐧𝐤
*┃* .𝐚𝐧𝐭𝐢𝐭𝐚𝐠 
*┃* .𝐰𝐞𝐥𝐜𝐨𝐦𝐞 
*┃* .𝐠𝐨𝐨𝐝𝐛𝐲𝐞
*┃* .𝐬𝐞𝐭𝐠𝐝𝐞𝐬𝐜 
*┃* .𝐬𝐞𝐭𝐠𝐧𝐚𝐦𝐞 
*┃* .𝐬𝐞𝐭𝐠𝐩𝐩 
*┗━━━━━━━━━━━━━❥❥❥*

*┏━━━━━━━━━━━━━❥❥❥*
*┃* *𝐎𝐰𝐧𝐞𝐫 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬*:
*┗━━━━━━━━━━━━━❥❥❥*
*┃* .𝐦𝐨𝐝𝐞 
*┃* .𝐜𝐥𝐞𝐚𝐫𝐬𝐞𝐬𝐬𝐢𝐨𝐧
*┃* .𝐚𝐧𝐭𝐢𝐝𝐞𝐥𝐞𝐭𝐞
*┃* .𝐜𝐥𝐞𝐚𝐫𝐭𝐦𝐩
*┃* .𝐮𝐩𝐝𝐚𝐭𝐞
*┃* .𝐬𝐞𝐭𝐭𝐢𝐧𝐠𝐬
*┃* .𝐬𝐞𝐭𝐩𝐩 
*┃* .𝐚𝐮𝐭𝐨𝐫𝐞𝐚𝐜𝐭 
*┃* .𝐚𝐮𝐭𝐨𝐬𝐭𝐚𝐭𝐮𝐬 
*┃* .𝐚𝐮𝐭𝐨𝐬𝐭𝐚𝐭𝐮𝐬 
*┃* .𝐚𝐮𝐭𝐨𝐭𝐲𝐩𝐢𝐧𝐠 
*┃* .𝐚𝐮𝐭𝐨𝐫𝐞𝐚𝐝
*┃* .𝐚𝐧𝐭𝐢𝐜𝐚𝐥𝐥
*┃* .𝐩𝐦𝐛𝐥𝐨𝐜𝐤𝐞𝐫 
*┃* .𝐩𝐦𝐛𝐥𝐨𝐜𝐤𝐞𝐫 
*┃* .𝐬𝐞𝐭𝐦𝐞𝐧𝐭𝐢𝐨𝐧 
*┃* .𝐦𝐞𝐧𝐭𝐢𝐨𝐧 
*┗━━━━━━━━━━━━━━━━❥❥❥*

*┏━━━━━━━━━━━━━━━━❥❥❥*
*┃* *𝐈𝐦𝐚𝐠𝐞/𝐒𝐭𝐢𝐜𝐤𝐞𝐫 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬*:
*┗━━━━━━━━━━━━━━━━❥❥❥*
*┃* .𝐛𝐥𝐮𝐫 
*┃* .𝐬𝐢𝐦𝐚𝐠𝐞 
*┃* .𝐬𝐭𝐢𝐜𝐤𝐞𝐫 
*┃* .𝐫𝐞𝐦𝐨𝐯𝐞𝐛𝐠
*┃* .𝐫𝐞𝐦𝐢𝐧𝐢
*┃* .𝐜𝐫𝐨𝐩 
*┗━━━━━━━━━━━━━━━━❥❥❥*

*┏━━━━━━━━━━━━━━━━❥❥❥*
*┃*  *𝐀𝐈 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬*:
*┗━━━━━━━━━━━━━━━━❥❥❥*
*┃* .𝐠𝐩𝐭 
*┃* .𝐠𝐞𝐦𝐢𝐧𝐢 
*┃* .𝐢𝐦𝐚𝐠𝐢𝐧𝐞 
*┃* .𝐬𝐨𝐫𝐚 
*┗━━━━━━━━━━━━━━━━❥❥❥*

*┏━━━━━━━━━━━━━❥❥❥*
*┃* *𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫*:
*┗━━━━━━━━━━━━━❥❥❥*
*┃* .𝐩𝐥𝐚𝐲 
*┃* .𝐬𝐨𝐧𝐠 
*┃* .𝐬𝐩𝐨𝐭𝐢𝐟𝐲
*┃* .𝐢𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦
*┃* .𝐟𝐚𝐜𝐞𝐛𝐨𝐨𝐤
*┃* .𝐭𝐢𝐤𝐭𝐨𝐤 
*┃* .𝐯𝐢𝐝𝐞𝐨 
*┃* .𝐲𝐭𝐦𝐩𝟒
*┗━━━━━━━━━━━━━❥❥❥*

*┏━━━━━━━━━━━━━━━━━━━❥❥❥*
*┃* *𝕡𝕠𝕨𝕖𝕣𝕖𝕕 𝙱𝚢 𝙰𝚌𝚑𝚊𝚔𝚣𝚊𝚒 04
*┗━━━━━━━━━━━━━━━━━━━❥❥❥*

Join our channel for updates:`;
            break;
    }
    
    await sock.sendMessage(chatId, { text: menuText });
    return true;
}

module.exports = { helpCommand, handleMenuSelection };
