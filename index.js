const express = require('express');
const yts = require('yt-search');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    const songName = req.query.name;

    if (!songName) {
        return res.status(400).json({ 
            status: false, 
            message: "කරුණාකර සින්දුවේ නම ඇතුළත් කරන්න. (Example: ?name=manike mage hithe)" 
        });
    }

    try {
        // YouTube එකේ සින්දුව සර්ච් කිරීම
        const searchResult = await yts(songName);
        const video = searchResult.videos[0]; 

        if (!video) {
            return res.status(404).json({ 
                status: false, 
                message: "සින්දුව හමු නොවීය." 
            });
        }

        // Direct MP3 ලබාගන්නා ලින්ක් එක (Stable Server)
        const downloadUrl = `https://api.vkrdown.com/server/index.php?url=${encodeURIComponent(video.url)}&format=mp3`;

        res.json({
            status: true,
            creator: "Sandaru Udan",
            results: {
                title: video.title,
                artist: video.author.name,
                duration: video.timestamp,
                views: video.views,
                thumbnail: video.thumbnail,
                download_link: downloadUrl, // කෙලින්ම MP3 ගන්න ලින්ක් එක
                youtube_url: video.url
            }
        });

    } catch (error) {
        res.status(500).json({ 
            status: false, 
            error: "දත්ත ලබා ගැනීමේදී දෝෂයක් සිදුවිය.",
            details: error.message 
        });
    }
});

// මුල් පිටුව
app.get('/', (req, res) => {
    res.json({ 
        message: "YouTube Song Search API is Live!",
        creator: "Sandaru Udan"
    });
});

module.exports = app;
