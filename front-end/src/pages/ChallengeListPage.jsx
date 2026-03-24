import api from "../api";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';
import Filters from "../components/Filters";
import imgDE from '../assets/Eber-Confused.png';
import imgCH from '../assets/Iggy-Confused.png';


export default function ChallengeListPage() {
  const {initialChallenges} = useLoaderData();

  const [challenges, setChallenges] = useState([...initialChallenges]);
  const [secondLanguage, setSecondLanguage] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const meta = useSEOMeta({
    title: `Learn-Swiss: Challenges - Test Your Swiss-German Skills`,
    description: `Challenge your Swiss-German & German knowledge with interactive exercises. Test vocabulary, grammar, and comprehension across multiple difficulty levels.`,
    canonicalUrl: `https://www.learn-swiss.ch/challenges`,
    keywords: `Swiss German challenges, German language exercises, Schwiizerdüütsch, dialect learning`,
    schema: { "@context": "https://schema.org", "@type": "CollectionPage", "headline": "Challenges", "description": "Challenge your Swiss-German & German knowledge", "url": "https://www.learn-swiss.ch/challenges" }
  });

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filteredChallenges = initialChallenges.filter((challenge) =>
        challenge.title.toLowerCase().includes(lowerQuery) && 
        (secondLanguage === "All" || challenge.language === secondLanguage));
      setChallenges(filteredChallenges);
  }, [initialChallenges, secondLanguage, searchQuery])

  const navigate = useNavigate();
  
  const getCompletionPercent = (completedByUser, totalItems) => {
    if (totalItems <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, (completedByUser / totalItems) * 100));
  };

  return (
    <>
    <PageHelmet {...meta} />
    <div className="container center">
      <div className="card" >
        <h1>Challenges</h1>
          <p>{meta.description}</p>
          <Filters
            items={[
              {
                type: "select",
                id: "secondLanguage",
                label: "Language",
                value: secondLanguage,
                onChange: (value) => setSecondLanguage(value),
                options: [
                  { value: "All" },
                  { value: "Swiss-German" },
                  { value: "German" },
                ],
              },
              {
                type: "text",
                id: "search-query",
                label: "Search",
                value: searchQuery,
                onChange: (value) => setSearchQuery(value),
              },
            ]}
          />
          <ul className="scenario-list">
            {challenges.map(challenge => {
              const completionPercent = getCompletionPercent(challenge.completedByUser, challenge.totalChallenges);

              return (
              <li key={challenge.reference} className="scenario-list-item">
                <div
                  className="scenario-card"
                  style={{ "--completion-percent": `${completionPercent}%` }}
                  onClick={() => navigate(`/challenges/${challenge.reference}/practice`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigate(`/challenges/${challenge.reference}/practice`); } }}
                  aria-label={`Open Challenge title: ${challenge.title}`}
                >
                  <img src={challenge.language === "Swiss-German" ? imgCH : imgDE} alt={challenge.title} className="scenario-card-img" />
                  <div className="scenario-card-title">{challenge.title}</div>
                </div>
              </li>
              );
            })}
          </ul>
      </div>
    </div>
    </>
  );
}

export async function loader () {
  const response = await api.get(`/challenges/`);
  const initialChallenges = response.data;
  return {initialChallenges};
}