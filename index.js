const express = require('express');
const yts = require('yt-search');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    const query = req.query.name;

    if (!query) {
        return res.status(400).json({ status: false, message: "Name is required" });
    }

    try {
        // YouTube එකේ search කරනවා
        const results = await yts(query);
        const video = results.videos[0]; // පලවෙනි result එක ගන්නවා

        if (!video) {
            return res.json({ status: false, message: "No song found" });
        }

        // මෙතැනදී අපි download link එක විදිහට දෙන්නේ MP3 එකකට convert කරලා දෙන public site එකක link එකක්
        const downloadLink = `https://api.vevioz.com/@api/button/mp3/${video.videoId}`;

        res.json({
            status: true,
            results: {
                title: video.title,
                artist: video.author.name,
                image: video.thumbnail, // Poster එක
                duration: video.timestamp,
                views: video.views,
                download: downloadLink, // Direct MP3 Button link
                source_url: video.url
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
