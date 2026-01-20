import api from "../api";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import imgStoriesDE from '../assets/BoarBook.png';


export default function ChallengeListPage() {
  const {challenges} = useLoaderData();
  
  const title = `Learn-Swiss: Challenges`;
  const description = `Challenge your Swiss-German & German knowledge!`;
  const canonicalUrl = `https://learn-swiss.ch/challenges`;
  const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

  const navigate = useNavigate();

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
      <div className="card" >
        <h1>Challenges</h1>
          <p>{description}</p>
          <ul className="scenario-list">
            {challenges.map(challenge => (
              <li key={challenge.reference} className="scenario-list-item">
                <div
                  className="scenario-card"
                  onClick={() => navigate(`/challenges/${challenge.reference}/practice`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigate(`/challenges/${challenge.reference}/practice`); } }}
                  aria-label={`Open Challenge title: ${challenge.title}`}
                >
                  <img src={imgStoriesDE} alt={challenge.title} className="scenario-card-img" />
                  <div className="scenario-card-title">{challenge.title} <br />({Math.trunc(challenge.completedByUser/challenge.totalChallenges * 100)}% complete)</div>
                </div>
              </li>
            ))}
          </ul>
      </div>
    </div>
    </>
  );
}

export async function loader () {
  const response = await api.get(`/challenges/`);
  const challenges = response.data;
  return {challenges};
}