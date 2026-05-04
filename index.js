const express = require('express');
const yts = require('yt-search');
const cors = require('cors');

const app = express();
app.use(cors());

// API search endpoint
app.get('/api/search', async (req, res) => {
    const songName = req.query.name;

    if (!songName) {
        return res.status(400).json({ status: false, message: "සින්දුවේ නම ඇතුළත් කරන්න." });
    }

    try {
        // YouTube එකේ search කිරීම
        const searchResult = await yts(songName);
        const video = searchResult.videos[0]; // පලවෙනි result එක විතරක් ගන්නවා

        if (!video) {
            return res.status(404).json({ status: false, message: "සින්දුව හමු නොවීය." });
        }

        // YouTube details සහ Download link එක සකස් කිරීම
        // මෙතනදී අපි Video ID එක පාවිච්චි කරලා Download link එක හදනවා
        const downloadUrl = `https://api.vevioz.com/@api/button/mp3/${video.videoId}`;

        res.json({
            status: true,
            creator: "Sandaru Udan",
            results: {
                title: video.title,
                artist: video.author.name,
                duration: video.timestamp,
                views: video.views,
                posted: video.ago,
                thumbnail: video.thumbnail, // Poster එක
                download_link: downloadUrl, // MP3 ගන්න ලින්ක් එක
                youtube_url: video.url
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

// Default route
app.get('/', (req, res) => {
    res.json({ message: "YouTube Song Search API is Live!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
