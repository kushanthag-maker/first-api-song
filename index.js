const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// මෙතනින් තමයි සින්දුවේ විස්තර ගන්නේ
app.get('/api/song', async (req, res) => {
    const songUrl = req.query.url;

    if (!songUrl || !songUrl.includes('sarigama.lk')) {
        return res.status(400).json({ 
            status: false, 
            message: "කරුණාකර නිවැරදි sarigama.lk ලින්ක් එකක් ලබා දෙන්න." 
        });
    }

    try {
        const { data } = await axios.get(songUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        // සයිට් එකේ HTML එකෙන් විස්තර වෙන් කර ගැනීම
        const title = $('h1.song-title').text().trim() || 'නම හමු නොවීය';
        const artist = $('.artist-name').first().text().trim() || 'ගායකයා හමු නොවීය';
        const poster = $('.song-poster img').attr('src') || '';
        const downloadLink = $('a.download-button').attr('href') || '';

        res.json({
            status: true,
            results: {
                title: title,
                artist: artist,
                image: poster.startsWith('http') ? poster : `https://sarigama.lk${poster}`,
                download: downloadLink.startsWith('http') ? downloadLink : `https://sarigama.lk${downloadLink}`
            }
        });

    } catch (error) {
        res.status(500).json({ 
            status: false, 
            message: "දත්ත ලබා ගැනීමට නොහැකි විය." 
        });
    }
});

// මුල් පිටුවට පණිවිඩයක්
app.get('/', (req, res) => {
    res.send('Sarigama API is Running Successfully!');
});

module.exports = app;
