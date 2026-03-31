const fs = require('fs');
const path = require('path');

// Redirect temp storage away from system /tmp
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => { });
                }
            });
        }
    });
    console.log('🧹 Temp folder auto-cleaned');
}, 3 * 60 * 60 * 1000);

const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');

// Import menu handlers
const { helpCommand, handleMenuSelection } = require('./commands/help');

// Import all commands
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { isSudo } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./commands/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');

// Command imports
const tagAllCommand = require('./commands/tagall');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const { Antilink } = require('./lib/antilink');
const { handleMentionDetection, mentionToggleCommand, setMentionCommand } = require('./commands/mention');

const tagCommand = require('./commands/tag');
const tagNotAdminCommand = require('./commands/tagnotadmin');
const hideTagCommand = require('./commands/hidetag');

const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const kickCommand = require('./commands/kick');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const { startHangman, guessLetter } = require('./commands/hangman');


const { lyricsCommand } = require('./commands/lyrics');

const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const blurCommand = require('./commands/img-blur');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./commands/goodbye');

const { handleAntiBadwordCommand, handleBadwordDetection } = require('./lib/antibadword');
const antibadwordCommand = require('./commands/antibadword');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');

const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');

const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./commands/groupmanage');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const spotifyCommand = require('./commands/spotify');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const aiCommand = require('./commands/ai');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { goodnightCommand } = require('./commands/goodnight');

const imagineCommand = require('./commands/imagine');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');

const stickercropCommand = require('./commands/stickercrop');
const removebgCommand = require('./commands/removebg');
const { reminiCommand } = require('./commands/remini');
const { igsCommand } = require('./commands/igs');
const { anticallCommand, readState: readAnticallState } = require('./commands/anticall');
const { pmblockerCommand, readState: readPmBlockerState } = require('./commands/pmblocker');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');


// Global settings
global.packname = settings.packname;
global.author = settings.author;
global.channelLink = "https://whatsapp.com/channel/0029VbCf0uq9xVJbJhdYjC27";
global.ytch = "Umari Projects";

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363423640651952@newsletter',
            newsletterName: 'Achakzai 04 MD',
            serverMessageId: -1
        }
    }
};

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        // Handle autoread
        await handleAutoread(sock, message);

        // Store message for antidelete
        if (message.message) {
            storeMessage(sock, message);
        }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);

        // Handle button responses
        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            if (buttonId === 'channel') {
                await sock.sendMessage(chatId, {
                    text: `📢 *Join our Channel:*\n${global.channelLink}`
                }, { quoted: message });
                return;
            } else if (buttonId === 'owner') {
                await ownerCommand(sock, chatId);
                return;
            }
        }

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            message.message?.buttonsResponseMessage?.selectedButtonId?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        // ========== MENU HANDLING ==========
        const menuSessions = global.menuSessions;
        if (menuSessions?.has(chatId) && /^[1-7]$/.test(userMessage)) {
            const handled = await handleMenuSelection(sock, message, chatId);
            if (handled) return;
        }
        
        if (userMessage === '.menu' || userMessage === '.help') {
            await helpCommand(sock, chatId, message);
            return;
        }

        // Only log command usage
        if (userMessage.startsWith('.')) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }
        
        // Read bot mode
        let isPublic = true;
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof data.isPublic === 'boolean') isPublic = data.isPublic;
        } catch (error) {
            // default isPublic=true on error
        }
        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;
        
        // Check if user is banned
        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '❌ You are banned from using the bot. Contact an admin to get unbanned.',
                    ...channelInfo
                });
            }
            return;
        }

        // Check for game move
        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        // Moderation in groups only
        if (isGroup) {
            if (userMessage) {
                await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            }
            await Antilink(message, sock);
        }

        // PM blocker
        if (!isGroup && !message.key.fromMe && !senderIsSudo) {
            try {
                const pmState = readPmBlockerState();
                if (pmState.enabled) {
                    await sock.sendMessage(chatId, { text: pmState.message || 'Private messages are blocked. Please contact the owner in groups only.' });
                    await new Promise(r => setTimeout(r, 1500));
                    try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
                    return;
                }
            } catch (e) { }
        }

        // Check for command prefix
        if (!userMessage.startsWith('.')) {
            await handleAutotypingForMessage(sock, chatId, userMessage);
            if (isGroup) {
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);
                if (isPublic || isOwnerOrSudoCheck) {
                    await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                }
            } else if (!isGroup && (isPublic || isOwnerOrSudoCheck)) {
                // Private chat chatbot
                await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
            }
            return;
        }
        
        // In private mode, only owner/sudo can run commands
        if (!isPublic && !isOwnerOrSudoCheck) {
            return;
        }

        // Admin commands list
        const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote', '.kick', '.tagall', '.tagnotadmin', '.hidetag', '.antilink', '.antitag', '.setgdesc', '.setgname', '.setgpp'];
        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));

        // Owner commands list
        const ownerCommands = ['.mode', '.autostatus', '.antidelete', '.cleartmp', '.setpp', '.fullpp', '.clearsession', '.areact', '.autoreact', '.autotyping', '.autoread', '.pmblocker'];
        const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        // Check admin status only for admin commands in groups
        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'Bot must be admin to use this command.', ...channelInfo }, { quoted: message });
                return;
            }

            if (userMessage.startsWith('.mute') || userMessage === '.unmute' ||
                userMessage.startsWith('.ban') || userMessage.startsWith('.unban') ||
                userMessage.startsWith('.promote') || userMessage.startsWith('.demote')) {
                if (!isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, {
                        text: 'Sorry, only group admins can use this command.',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
            }
        }

        // Check owner status for owner commands (works in both group and private)
        if (isOwnerCommand) {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner or sudo!' }, { quoted: message });
                return;
            }
        }

        let commandExecuted = false;

        // Command handlers - ALL commands work in BOTH group and private
        switch (true) {
            // General Commands (work everywhere)
            case userMessage === '.ping':
                await pingCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.alive':
                await aliveCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.owner':
                await ownerCommand(sock, chatId);
                commandExecuted = true;
                break;
            case userMessage === '.fact':
                await factCommand(sock, chatId, message, message);
                commandExecuted = true;
                break;
            case userMessage === '.joke':
                await jokeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.quote':
                await quoteCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.vv':
                await viewOnceCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.jid':
                const jid = message.key.remoteJid;
                await sock.sendMessage(chatId, { text: `✅ Your JID: ${jid}` }, { quoted: message });
                commandExecuted = true;
                break;
            case userMessage === '.try':
                await sock.sendMessage(chatId, { text: '✅ Command is working perfectly!' }, { quoted: message });
                commandExecuted = true;
                break;
            case userMessage === '.ss':
                await handleSsCommand(sock, chatId, message, '');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.url'):
                await urlCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.weather'):
                const city = userMessage.slice(9).trim();
                if (city) {
                    await weatherCommand(sock, chatId, message, city);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please specify a city, e.g., .weather London', ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
            case userMessage === '.news':
                await newsCommand(sock, chatId);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.tts'):
                const text = userMessage.slice(4).trim();
                await ttsCommand(sock, chatId, text, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.attp'):
                await attpCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.lyrics'):
                const songTitle = userMessage.split(' ').slice(1).join(' ');
                await lyricsCommand(sock, chatId, songTitle, message);
                commandExecuted = true;
                break;
            case userMessage === '.groupinfo':
                if (isGroup) {
                    await groupInfoCommand(sock, chatId, message);
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!' }, { quoted: message });
                }
                commandExecuted = true;
                break;
            case userMessage === '.staff' || userMessage === '.admins':
                if (isGroup) {
                    await staffCommand(sock, chatId, message);
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!' }, { quoted: message });
                }
                commandExecuted = true;
                break;
            case userMessage === '.git' || userMessage === '.github' || userMessage === '.repo':
                await githubCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.flirt':
                await flirtCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.dare':
                await dareCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.truth':
                await truthCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.goodnight' || userMessage === '.gn':
                await goodnightCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.shayari' || userMessage === '.shayri':
                await shayariCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.roseday':
                await rosedayCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.character'):
                await characterCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.ship':
                if (isGroup) {
                    await shipCommand(sock, chatId, message);
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!' }, { quoted: message });
                }
                commandExecuted = true;
                break;
                
            // Image/Sticker Commands
            case userMessage === '.sticker' || userMessage === '.s':
                await stickerCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.blur'):
                await blurCommand(sock, chatId, message, message.message?.extendedTextMessage?.contextInfo?.quotedMessage);
                commandExecuted = true;
                break;
            case userMessage === '.simage':
                const quotedImg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedImg?.stickerMessage) {
                    await simageCommand(sock, quotedImg, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please reply to a sticker with .simage', ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
            case userMessage === '.crop':
                await stickercropCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.removebg') || userMessage.startsWith('.rmbg'):
                await removebgCommand.exec(sock, message, userMessage.split(' ').slice(1));
                commandExecuted = true;
                break;
            case userMessage.startsWith('.remini') || userMessage.startsWith('.enhance'):
                await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1));
                commandExecuted = true;
                break;
            case userMessage.startsWith('.emojimix') || userMessage.startsWith('.emix'):
                await emojimixCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.take') || userMessage.startsWith('.steal'):
                const takeArgs = rawText.slice(userMessage.startsWith('.steal') ? 6 : 5).trim().split(' ');
                await takeCommand(sock, chatId, message, takeArgs);
                commandExecuted = true;
                break;
                
            // Downloader Commands
            case userMessage.startsWith('.play') || userMessage.startsWith('.song'):
                await songCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.video') || userMessage.startsWith('.ytmp4'):
                await videoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.spotify'):
                await spotifyCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.instagram') || userMessage.startsWith('.insta') || userMessage === '.ig':
                await instagramCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.igs'):
                await igsCommand(sock, chatId, message, false);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.fb') || userMessage.startsWith('.facebook'):
                await facebookCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.tiktok') || userMessage.startsWith('.tt'):
                await tiktokCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            // AI Commands
            case userMessage.startsWith('.gpt') || userMessage.startsWith('.gemini'):
                await aiCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.imagine') || userMessage.startsWith('.dalle'):
                await imagineCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.sora'):
                await soraCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            // Owner Commands (work in both group and private)
            case userMessage === '.setpp':
                await setProfilePicture(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.fullpp':
                await fullPpCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.mode'):
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: 'Only bot owner can use this command!', ...channelInfo }, { quoted: message });
                    return;
                }
                let data;
                try {
                    data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
                } catch (error) {
                    await sock.sendMessage(chatId, { text: 'Failed to read bot mode status', ...channelInfo });
                    return;
                }
                const action = userMessage.split(' ')[1]?.toLowerCase();
                if (!action) {
                    const currentMode = data.isPublic ? 'public' : 'private';
                    await sock.sendMessage(chatId, {
                        text: `Current bot mode: *${currentMode}*\n\n.mode public - Allow everyone\n.mode private - Restrict to owner only`,
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                if (action !== 'public' && action !== 'private') {
                    await sock.sendMessage(chatId, { text: 'Usage: .mode public/private', ...channelInfo }, { quoted: message });
                    return;
                }
                data.isPublic = action === 'public';
                fs.writeFileSync('./data/messageCount.json', JSON.stringify(data, null, 2));
                await sock.sendMessage(chatId, { text: `Bot is now in *${action}* mode`, ...channelInfo });
                commandExecuted = true;
                break;
            case userMessage === '.clearsession':
                await clearSessionCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.cleartmp':
                await clearTmpCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.settings':
                await settingsCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.autotyping'):
                await autotypingCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.autoread'):
                await autoreadCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.anticall'):
                const anticallArgs = userMessage.split(' ').slice(1).join(' ');
                await anticallCommand(sock, chatId, message, anticallArgs);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.pmblocker'):
                const pmArgs = userMessage.split(' ').slice(1).join(' ');
                await pmblockerCommand(sock, chatId, message, pmArgs);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.sudo'):
                await sudoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.antidelete'):
                const adMatch = userMessage.slice(11).trim();
                await handleAntideleteCommand(sock, chatId, message, adMatch);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.autostatus'):
                const asArgs = userMessage.split(' ').slice(1);
                await autoStatusCommand(sock, chatId, message, asArgs);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.areact') || userMessage.startsWith('.autoreact'):
                await handleAreactCommand(sock, chatId, message, isOwnerOrSudoCheck);
                commandExecuted = true;
                break;
                
            // Admin Commands (group only)
            case userMessage.startsWith('.ban'):
                if (!isGroup && !message.key.fromMe && !senderIsSudo) {
                    await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .ban in private chat.' }, { quoted: message });
                    break;
                }
                await banCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.unban'):
                await unbanCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.promote'):
                const promoteMentions = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await promoteCommand(sock, chatId, promoteMentions, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.demote'):
                const demoteMentions = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await demoteCommand(sock, chatId, demoteMentions, message);
                commandExecuted = true;
                break;
            case userMessage === '.tagall':
                await tagAllCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            case userMessage === '.tagnotadmin':
                await tagNotAdminCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.hidetag'):
                const htMsg = rawText.slice(8).trim();
                const htReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await hideTagCommand(sock, chatId, senderId, htMsg, htReply, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.tag'):
                const tagMsg = rawText.slice(4).trim();
                const tagReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await tagCommand(sock, chatId, senderId, tagMsg, tagReply, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.kick'):
                const kickMentions = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await kickCommand(sock, chatId, senderId, kickMentions, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.mute'):
                const muteParts = userMessage.trim().split(/\s+/);
                const muteArg = muteParts[1];
                const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
                if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                    await sock.sendMessage(chatId, { text: 'Please provide a valid number of minutes.', ...channelInfo }, { quoted: message });
                } else {
                    await muteCommand(sock, chatId, senderId, message, muteDuration);
                }
                commandExecuted = true;
                break;
            case userMessage === '.unmute':
                await unmuteCommand(sock, chatId, senderId);
                commandExecuted = true;
                break;
            case userMessage === '.clear':
                if (isGroup) await clearCommand(sock, chatId);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.delete') || userMessage.startsWith('.del'):
                await deleteCommand(sock, chatId, message, senderId);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.warnings'):
                const warnMentions = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warningsCommand(sock, chatId, warnMentions);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.warn'):
                const warnMentionsList = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warnCommand(sock, chatId, senderId, warnMentionsList, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.antilink'):
                await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.antitag'):
                await handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.antibadword'):
                await antibadwordCommand(sock, chatId, message, senderId, isSenderAdmin);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.chatbot'):
                const cbMatch = userMessage.slice(8).trim();
                await handleChatbotCommand(sock, chatId, message, cbMatch);
                commandExecuted = true;
                break;
            case userMessage === '.resetlink':
                await resetlinkCommand(sock, chatId, senderId);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.setgdesc'):
                const descText = rawText.slice(9).trim();
                await setGroupDescription(sock, chatId, senderId, descText, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.setgname'):
                const nameText = rawText.slice(9).trim();
                await setGroupName(sock, chatId, senderId, nameText, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.setgpp'):
                await setGroupPhoto(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.mention'):
                const mentionArgs = userMessage.split(' ').slice(1).join(' ');
                const isOwnerFlag = message.key.fromMe || senderIsSudo;
                await mentionToggleCommand(sock, chatId, message, mentionArgs, isOwnerFlag);
                commandExecuted = true;
                break;
            case userMessage === '.setmention':
                await setMentionCommand(sock, chatId, message, message.key.fromMe || senderIsSudo);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.welcome'):
                await welcomeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.goodbye'):
                await goodbyeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            // Other Commands
            case userMessage.startsWith('.translate') || userMessage.startsWith('.trt'):
                const transCmdLen = userMessage.startsWith('.translate') ? 10 : 4;
                await handleTranslateCommand(sock, chatId, message, userMessage.slice(transCmdLen));
                commandExecuted = true;
                break;
            case userMessage.startsWith('.ssweb') || userMessage.startsWith('.screenshot'):
                const ssUrl = userMessage.split(' ')[1];
                if (ssUrl) {
                    await handleSsCommand(sock, chatId, message, ssUrl);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a URL. Usage: .ssweb <url>' }, { quoted: message });
                }
                commandExecuted = true;
                break;
                
            default:
                if (isGroup && (isPublic || isOwnerOrSudoCheck)) {
                    await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                    await handleTagDetection(sock, chatId, message, senderId);
                    await handleMentionDetection(sock, chatId, message);
                } else if (!isGroup && (isPublic || isOwnerOrSudoCheck)) {
                    await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                }
                commandExecuted = false;
                break;
        }

        if (commandExecuted !== false) {
            await showTypingAfterCommand(sock, chatId);
            await addCommandReaction(sock, message);
        }
        
    } catch (error) {
        console.error('❌ Error in message handler:', error.message);
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;
        if (!id.endsWith('@g.us')) return;

        let isPublic = true;
        try {
            const modeData = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof modeData.isPublic === 'boolean') isPublic = modeData.isPublic;
        } catch (e) {}

        if (action === 'promote') {
            if (!isPublic) return;
            await handlePromotionEvent(sock, id, participants, author);
            return;
        }

        if (action === 'demote') {
            if (!isPublic) return;
            await handleDemotionEvent(sock, id, participants, author);
            return;
        }

        if (action === 'add') {
            await handleJoinEvent(sock, id, participants);
        }

        if (action === 'remove') {
            await handleLeaveEvent(sock, id, participants);
        }
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status);
    }
};