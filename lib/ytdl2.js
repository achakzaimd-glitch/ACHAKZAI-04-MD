/**
 * YouTube Downloader Module
 */

const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const config = require('./config');

const TEMP_DIR = config.paths.temp;

module.exports = {
    /**
     * Download YouTube video
     */
    download: async (sock, from, url) => {
        if (!url) {
            await sock.sendMessage(from, {
                text: '❌ Please provide a YouTube URL\nExample: !yt https://youtube.com/watch?v=123'
            });
            return;
        }

        try {
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            const duration = info.videoDetails.lengthSeconds;

            // Store session for format selection
            global.userSessions.set(from, {
                type: 'youtube',
                url: url,
                info: info,
                title: title,
                expires: Date.now() + 300000 // 5 minutes
            });

            // Show format menu
            const menu = `🎬 *${title.substring(0, 50)}${title.length > 50 ? '...' : ''}*
⏱️ Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}

*Select format:*

1️⃣ 144p
2️⃣ 240p
3️⃣ 360p
4️⃣ 480p
5️⃣ 720p
6️⃣ 1080p
7️⃣ 144p (Document)
8️⃣ 240p (Document)
9️⃣ 360p (Document)
🔟 480p (Document)
1️⃣1️⃣ 720p (Document)
1️⃣2️⃣ 1080p (Document)
1️⃣3️⃣ Audio MP3
1️⃣4️⃣ Audio 320kbps
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚌𝚑𝚊𝚔𝚣𝚊𝚒 04*

_Reply with number (1-14)_`;

            await sock.sendMessage(from, { text: menu });

        } catch (error) {
            console.error('YouTube error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to get video info. Please check the URL.'
            });
        }
    },

    /**
     * Handle format selection
     */
    handleFormatSelection: async (sock, from, selection) => {
        const session = global.userSessions.get(from);
        
        if (!session || session.expires < Date.now()) {
            await sock.sendMessage(from, {
                text: '❌ Session expired. Please use !yt again.'
            });
            return;
        }

        const qualities = {
            '1': '144p',
            '2': '240p',
            '3': '360p',
            '4': '480p',
            '5': '720p',
            '6': '1080p',
            '7': '144p',
            '8': '240p',
            '9': '360p',
            '10': '480p',
            '11': '720p',
            '12': '1080p',
            '13': 'audio',
            '14': 'audio'
        };

        const asDocument = parseInt(selection) >= 7 && parseInt(selection) <= 12;
        const quality = qualities[selection];

        if (!quality) {
            await sock.sendMessage(from, { text: '❌ Invalid selection.' });
            return;
        }

        await sock.sendMessage(from, { text: `⏳ Downloading ${quality}...` });

        try {
            const outputPath = path.join(TEMP_DIR, `yt_${Date.now()}.mp4`);

            if (quality === 'audio') {
                // Download audio
                const audioStream = ytdl(session.url, { quality: 'highestaudio' });
                
                await new Promise((resolve, reject) => {
                    ffmpeg(audioStream)
                        .audioBitrate(selection === '14' ? '320k' : '128k')
                        .save(outputPath.replace('.mp4', '.mp3'))
                        .on('end', resolve)
                        .on('error', reject);
                });

                await sock.sendMessage(from, {
                    audio: { url: outputPath.replace('.mp4', '.mp3') },
                    mimetype: 'audio/mpeg',
                    caption: `🎵 ${session.title}`
                });

                fs.unlinkSync(outputPath.replace('.mp4', '.mp3'));
            } else {
                // Download video
                const videoStream = ytdl(session.url, { quality: 'highest' });
                const writeStream = fs.createWriteStream(outputPath);

                await new Promise((resolve, reject) => {
                    videoStream.pipe(writeStream);
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                const stats = await fs.stat(outputPath);
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

                const messageOptions = {
                    [asDocument ? 'document' : 'video']: { url: outputPath },
                    mimetype: 'video/mp4',
                    fileName: asDocument ? `${session.title}_${quality}.mp4` : undefined,
                    caption: asDocument ? undefined : `🎬 ${session.title}\nQuality: ${quality}\nSize: ${sizeMB}MB`
                };

                await sock.sendMessage(from, messageOptions);
                fs.unlinkSync(outputPath);
            }

            global.botStats.downloads++;
            global.userSessions.delete(from);

        } catch (error) {
            console.error('Download error:', error);
            await sock.sendMessage(from, {
                text: '❌ Download failed. Please try again.'
            });
        }
    },

    /**
     * Download audio only
     */
    downloadAudio: async (sock, from, url) => {
        if (!url) {
            await sock.sendMessage(from, {
                text: '❌ Please provide a YouTube URL'
            });
            return;
        }

        try {
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;

            await sock.sendMessage(from, { text: `🎵 Downloading audio: ${title}` });

            const audioStream = ytdl(url, { quality: 'highestaudio' });
            const outputPath = path.join(TEMP_DIR, `audio_${Date.now()}.mp3`);

            await new Promise((resolve, reject) => {
                ffmpeg(audioStream)
                    .audioBitrate('128k')
                    .save(outputPath)
                    .on('end', resolve)
                    .on('error', reject);
            });

            await sock.sendMessage(from, {
                audio: { url: outputPath },
                mimetype: 'audio/mpeg',
                caption: `🎵 ${title}`
            });

            fs.unlinkSync(outputPath);
            global.botStats.downloads++;

        } catch (error) {
            console.error('Audio download error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to download audio.'
            });
        }
    },

    /**
     * Search and play YouTube video
     */
    searchAndPlay: async (sock, from, query) => {
        if (!query) {
            await sock.sendMessage(from, {
                text: '❌ Please provide a search query\nExample: !ytplay despacito'
            });
            return;
        }

        try {
            const results = await ytSearch(query);
            
            if (results.videos.length === 0) {
                await sock.sendMessage(from, { text: '❌ No results found' });
                return;
            }

            let searchResults = `🔍 *Search Results for: ${query}*\n\n`;
            results.videos.slice(0, 5).forEach((video, i) => {
                searchResults += `${i + 1}. ${video.title}\n`;
                searchResults += `   ⏱️ ${video.timestamp} | 👤 ${video.author.name}\n\n`;
            });
            searchResults += '_Reply with number 1-5 to download_';

            await sock.sendMessage(from, { text: searchResults });

            // Store search results
            global.userSessions.set(`search_${from}`, {
                videos: results.videos.slice(0, 5),
                expires: Date.now() + 120000
            });

        } catch (error) {
            console.error('Search error:', error);
            await sock.sendMessage(from, {
                text: '❌ Search failed. Please try again.'
            });
        }
    },
};