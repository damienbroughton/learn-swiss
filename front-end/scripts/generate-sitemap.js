import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SitemapStream, streamToPromise } from 'sitemap';

const SITE_URL = "https://www.learn-swiss.ch"

async function fetchJson(pathSegment) {
    const url = `${SITE_URL}/api/${pathSegment}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
            return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error(`Error fetching ${url}:`, err);
        return [];
    }
}

async function generateSitemap() {
    console.log('Generating Sitemap...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename); 

    // Define static pages
    const staticPages = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/make-flashcards', changefreq: 'weekly', priority: 0.8 },
        { url: '/flashcards', changefreq: 'weekly', priority: 0.7 },
        { url: '/scenarios', changefreq: 'weekly', priority: 0.6 },
        { url: '/challenges', changefreq: 'weekly', priority: 0.5 },
        { url: '/stories', changefreq: 'weekly', priority: 0.8 },
        { url: '/login', changefreq: 'weekly', priority: 0.5 },
        { url: '/create-account', changefreq: 'weekly', priority: 0.5 }
    ]

    // Fetch dynamic content for individual pages
    const [
        stories,
        scenarios,
        challenges,
        flashcardCategories,
    ] = await Promise.all([
        // Stories collection – used for /stories/:reference
        fetchJson('stories/'),
        // Scenarios collection – used for /scenarios/:reference/:mode
        fetchJson('scenarios/'),
        // Challenges collection – used for /challenges/:reference/:mode
        fetchJson('challenges/'),
        // Flashcard categories for /flashcard/:category (Swiss-German)
        fetchJson('flashcards/categories/Swiss-German'),
    ]);

    const dynamicPages = [
        // Individual story pages
        ...stories
            .filter(story => story && story.reference)
            .map(story => ({
                url: `/stories/${encodeURIComponent(story.reference)}`,
                changefreq: 'weekly',
                priority: 0.8,
            })),

        // Individual scenario pages – use "practice" as canonical mode
        ...scenarios
            .filter(scenario => scenario && scenario.reference)
            .map(scenario => ({
                url: `/scenarios/${encodeURIComponent(scenario.reference)}/practice`,
                changefreq: 'weekly',
                priority: 0.6,
            })),

        // Individual challenge pages – use "practice" as canonical mode
        ...challenges
            .filter(challenge => challenge && challenge.reference)
            .map(challenge => ({
                url: `/challenges/${encodeURIComponent(challenge.reference)}/practice`,
                changefreq: 'weekly',
                priority: 0.5,
            })),

        // Individual flashcard category pages
        ...flashcardCategories
            .filter(category => category && category.category)
            .map(category => ({
                url: `/flashcard/${encodeURIComponent(category.category)}`,
                changefreq: 'weekly',
                priority: 0.5,
            })),
    ];

    // combine static and dynamic pages
    const allLinks = [...staticPages, ...dynamicPages];

    //Create site map to stream
    const siteMapStream = new SitemapStream({
        hostname: SITE_URL,
        xmlns: {
            sitemap: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        }
    });

    allLinks.forEach(link => siteMapStream.write(link));
    siteMapStream.end();

    //Save sitemap to xml and save in public folder
    try {
        const xml = await streamToPromise(siteMapStream);
        const sitemapPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
        fs.writeFileSync(sitemapPath, xml.toString());
        console.log(`Sitemap generated successfully with ${allLinks.length} links at ${sitemapPath}`);

    } catch (error) {
        console.error('Error generating or writing sitemap:', error);
    }
}

// Execute the function directly
generateSitemap().catch(e => {
    console.error('Sitemap script failed:', e);
    process.exit(1);
});
