import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SitemapStream, streamToPromise } from 'sitemap';

const SITE_URL = "https://www.learn-swiss.ch"

async function generateSitemap() {
    console.log('Generating Sitemap...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename); 

    // Define static pages
    const staticPages = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/make-flashcards', changefreq: 'weekly', priority: 0.8 },
        { url: '/flashcards', changefreq: 'weekly', priority: 0.7 },
        { url: '/flashcards/Basics', changefreq: 'weekly', priority: 0.5 },
        { url: '/scenarios', changefreq: 'weekly', priority: 0.6 },
        { url: '/challenges', changefreq: 'weekly', priority: 0.5 },
        { url: '/stories', changefreq: 'weekly', priority: 0.8 },
        { url: '/stories/räbeliechtli', changefreq: 'weekly', priority: 0.8 },
        { url: '/stories/-luftballons', changefreq: 'weekly', priority: 0.8 },
        { url: '/stories/de-frühlig-isch-au-scho-uf-dberge-cho', changefreq: 'weekly', priority: 0.8 },
        { url: '/login', changefreq: 'weekly', priority: 0.5 },
        { url: '/create-account', changefreq: 'weekly', priority: 0.5 }
    ]

    // Define dynamic pages
    // TODO: individual story pages

    // combine static and TODO dynamic pages
    const allLinks = [...staticPages];

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
