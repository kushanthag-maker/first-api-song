const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// සින්දු සර්ච් කරලා විස්තර ගන්නා endpoint එක
app.get('/api/search', async (req, res) => {
    const query = req.query.name;

    if (!query) {
        return res.status(400).json({ 
            status: false, 
            message: "කරුණාකර සින්දුවේ නමක් ලබා දෙන්න. (Example: ?name=lokeyan yamu)" 
        });
    }

    try {
        // 1. මුලින්ම සින්දුව සර්ච් කරනවා
        const searchUrl = `https://sarigama.lk/search?q=${encodeURIComponent(query)}`;
        const { data: searchData } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $search = cheerio.load(searchData);
        
        // පළවෙනි සර්ච් රිසල්ට් එකේ ලින්ක් එක ගන්නවා
        const firstResult = $('.song-card a').first().attr('href');

        if (!firstResult) {
            return res.json({ status: false, message: "සින්දුව හමු නොවීය." });
        }

        const songFullUrl = firstResult.startsWith('http') ? firstResult : `https://sarigama.lk${firstResult}`;

        // 2. සින්දුවේ පිටුවට ගිහින් විස්තර ටික ගන්නවා
        const { data: songData } = await axios.get(songFullUrl);
        const $ = cheerio.load(songData);

        const title = $('h1.song-title').text().trim() || 'N/A';
        const artist = $('.artist-name').first().text().trim() || 'N/A';
        const poster = $('.song-poster img').attr('src') || '';
        const downloadLink = $('a.download-button').attr('href') || '';

        res.json({
            status: true,
            results: {
                title: title,
                artist: artist,
                image: poster.startsWith('http') ? poster : `https://sarigama.lk${poster}`,
                download: downloadLink.startsWith('http') ? downloadLink : `https://sarigama.lk${downloadLink}`,
                source_url: songFullUrl
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "දත්ත ලබා ගැනීමේදී දෝෂයක් සිදුවිය." });
    }
});

app.get('/', (req, res) => {
    res.send('Sarigama Search API is Live!');
});

module.exports = app;
