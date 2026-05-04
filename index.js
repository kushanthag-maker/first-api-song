const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// Common header to avoid getting blocked
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
};

app.get('/api/search', async (req, res) => {
    const query = req.query.name;

    if (!query) {
        return res.status(400).json({ 
            status: false, 
            message: "කරුණාකර සින්දුවේ නමක් ලබා දෙන්න." 
        });
    }

    try {
        const searchUrl = `https://sarigama.lk/search?q=${encodeURIComponent(query)}`;
        const { data: searchData } = await axios.get(searchUrl, { headers });

        const $search = cheerio.load(searchData);
        
        // Selector එක නිවැරදිදැයි පරීක්ෂා කරන්න (උදා: .song-item a)
        let firstResult = $search('.song-card a, .song-item a').first().attr('href');

        if (!firstResult) {
            return res.json({ status: false, message: "සින්දුව හමු නොවීය." });
        }

        const songFullUrl = firstResult.startsWith('http') ? firstResult : `https://sarigama.lk${firstResult}`;

        const { data: songData } = await axios.get(songFullUrl, { headers });
        const $ = cheerio.load(songData);

        const title = $('h1').first().text().trim() || 'N/A';
        const artist = $('.artist-name, .singer-name').text().trim() || 'N/A';
        let poster = $('.song-poster img, .album-art img').attr('src') || '';
        let downloadLink = $('a[href*="download"], .download-button').attr('href') || '';

        // URL fix
        if (poster && !poster.startsWith('http')) poster = `https://sarigama.lk${poster}`;
        if (downloadLink && !downloadLink.startsWith('http')) downloadLink = `https://sarigama.lk${downloadLink}`;

        res.json({
            status: true,
            results: {
                title: title,
                artist: artist,
                image: poster,
                download: downloadLink,
                source_url: songFullUrl
            }
        });

    } catch (error) {
        res.status(500).json({ 
            status: false, 
            message: "Server Error",
            error: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
