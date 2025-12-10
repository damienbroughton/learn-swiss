import { Helmet } from 'react-helmet-async';
import iggyImage from '../assets/IggyLogo.png';
import useAppUser from '../hooks/useAppUser';

export default function Homepage() {
  const { appUser } = useAppUser();

  const title = `Learn-Swiss`;
  const description = `Learn Swiss-German by practicing with flashcards, rehearsing fun scenarios, and learning stories.`;
  const canonicalUrl = `https://learn-swiss.ch/flashcards`;
  const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

  return (
    <>
    <Helmet>
        {/* Dynamic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(storySchema)}</script>
    </Helmet>
    <div className="container center">
      <div className="card">
        <h1 style={{ marginBottom: '0.5em' }}>Welcome to Learn-Swiss{appUser && `, ${appUser.username}`}</h1>
        <p>{description}</p>
        <img src={iggyImage} alt="Iggy the Hedgehog mascot" className="homepage-img" style={{ width: '160px', height: '160px', objectFit: 'contain', margin: '0 auto 1.5em auto', display: 'block', borderRadius: '50%', boxShadow: '0 2px 16px 0 rgba(44,62,80,0.08)' }} />
        <p><b>Note:</b> this site is not currently public and still under construction with regular deployments and feature testing.</p>
      </div>
    </div>
    </>
  );
}
