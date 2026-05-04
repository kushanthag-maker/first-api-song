const express = require('express');
const yts = require('yt-search');
const cors = require('cors');

const app = express();
app.use(cors());

// Home Route
app.get('/', (req, res) => {
    res.send('Song Search API is Live! Use /api/search?name=SongName');
});

// Search API Endpoint
app.get('/api/search', async (req, res) => {
    const query = req.query.name;

    if (!query) {
        return res.status(400).json({ 
            status: false, 
            message: "කරුණාකර සින්දුවේ නමක් ලබා දෙන්න." 
        });
    }

    try {
        // YouTube එකේ සින්දුව සර්ච් කරනවා
        const results = await yts(query);
        const video = results.videos[0]; // පලවෙනි result එක ගන්නවා

        if (!video) {
            return res.json({ 
                status: false, 
                message: "සින්දුව හමු නොවීය." 
            });
        }

        // Direct MP3 Download Button Link (Stable External Service)
        const downloadLink = `https://api.vevioz.com/@api/button/mp3/${video.videoId}`;

        res.json({
            status: true,
            results: {
                title: video.title,
                artist: video.author.name,
                image: video.thumbnail,
                duration: video.timestamp,
                views: video.views,
                publish_date: video.ago,
                download: downloadLink, // මේ ලින්ක් එකෙන් කෙලින්ම MP3 ගන්න පුළුවන්
                source_url: video.url
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: false, 
            message: "Server Error",
            error_details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
