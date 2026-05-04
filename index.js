const express = require('express');
const yts = require('yt-search');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    const songName = req.query.name;

    if (!songName) {
        return res.status(400).json({ status: false, message: "කරුණාකර සින්දුවේ නම ඇතුළත් කරන්න." });
    }

    try {
        const searchResult = await yts(songName);
        const video = searchResult.videos[0];

        if (!video) {
            return res.status(404).json({ status: false, message: "සින්දුව හමු නොවීය." });
        }

        // මෙතනදී අපි එවන්නේ YouTube එකේ මුල් ලින්ක් එක විතරයි
        res.json({
            status: true,
            creator: "Sandaru Udan",
            results: {
                title: video.title,
                artist: video.author.name,
                duration: video.timestamp,
                views: video.views,
                thumbnail: video.thumbnail,
                youtube_url: video.url, // ප්‍රධාන YouTube ලින්ක් එක
                video_id: video.videoId  // වීඩියෝ එකේ ID එක
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, error: "දෝෂයක් සිදුවිය." });
    }
});

app.get('/', (req, res) => {
    res.json({ message: "YouTube Link API is Live!", creator: "Sandaru Udan" });
});

module.exports = app;
