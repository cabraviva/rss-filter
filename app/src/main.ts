import express from 'express';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const app = express();
const PORT = 3000;

// @ts-expect-error
app.get('/filter-rss', async (req, res) => {
    const rssUrl = req.query.rssUrl as string;

    if (!rssUrl) {
        return res.status(400).json({ error: 'RSS feed URL is required' });
    }

    try {
        // Fetch the RSS feed using axios
        const response = await axios.get(rssUrl);
        const rssData = response.data;

        // Parse the RSS feed
        const parsedData = await parseStringPromise(rssData, { explicitArray: false });

        // Filter out articles with '?' in the title
        const filteredItems = parsedData.rss.channel.item.filter((item: any) => !item.title.includes('?'));

        // Create a new RSS feed with filtered items
        const filteredRss = {
            rss: {
                ...parsedData.rss,
                channel: {
                    ...parsedData.rss.channel,
                    item: filteredItems,
                },
            },
        };

        // Convert the filtered RSS feed back to XML
        const builder = new (require('xml2js').Builder)();
        const filteredRssXml = builder.buildObject(filteredRss);

        res.set('Content-Type', 'application/xml');
        res.send(filteredRssXml);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the RSS feed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
