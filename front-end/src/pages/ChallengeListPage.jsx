import api from "../api";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';
import imgDE from '../assets/Eber-Happy.png';


export default function ChallengeListPage() {
  const {challenges} = useLoaderData();
  
  const meta = useSEOMeta({
    title: `Learn-Swiss: Challenges - Test Your Swiss-German Skills`,
    description: `Challenge your Swiss-German & German knowledge with interactive exercises. Test vocabulary, grammar, and comprehension across multiple difficulty levels.`,
    canonicalUrl: `https://www.learn-swiss.ch/challenges`,
    keywords: `Swiss German challenges, German language exercises, Schwiizerdüütsch, dialect learning`,
    schema: { "@context": "https://schema.org", "@type": "CollectionPage", "headline": "Challenges", "description": "Challenge your Swiss-German & German knowledge", "url": "https://www.learn-swiss.ch/challenges" }
  });

  const navigate = useNavigate();

  return (
    <>
    <PageHelmet {...meta} />
    <div className="container center">
      <div className="card" >
        <h1>Challenges</h1>
          <p>{meta.description}</p>
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
                  <img src={imgDE} alt={challenge.title} className="scenario-card-img" />
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