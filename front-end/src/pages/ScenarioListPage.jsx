import api from "../api";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';
import Filters from "../components/Filters";

export default function ScenarioListPage() {
  const {initialScenarios} = useLoaderData();

  const [scenarios, setScenarios] = useState([...initialScenarios]);
  const [searchQuery, setSearchQuery] = useState("");

  const meta = useSEOMeta({
    title: `Learn-Swiss: Scenarios - Practice Real-World Swiss-German Conversations`,
    description: `Learn Swiss-German through realistic scenarios and conversations. Practice common situational dialogues to improve comprehension and speaking skills.`,
    canonicalUrl: `https://www.learn-swiss.ch/scenarios`,
    keywords: `Swiss German scenarios, conversation practice, Schwiizerdüütsch dialogues, situational learning`,
    schema: { "@context": "https://schema.org", "@type": "CollectionPage", "headline": "Scenarios", "description": "Practice real-world conversations", "url": "https://www.learn-swiss.ch/scenarios" }
  });

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filteredScenarios = initialScenarios.filter((scenario) =>
        scenario.title.toLowerCase().includes(lowerQuery));
      setScenarios(filteredScenarios);
  }, [initialScenarios, searchQuery])

  const [practiceMode, setPracticeMode] = useState(() => {
    const saved = localStorage.getItem("practiceMode");
    return saved === "true"; // convert string to boolean
  });

  useEffect(() => {
    localStorage.setItem("practiceMode", practiceMode);
  }, [practiceMode]);

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
        <h1>Scenarios</h1>
        <p>{meta.description}</p>
          <Filters
            items={[
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
            { scenarios.map(scenario => {
              const completionPercent = getCompletionPercent(scenario.completedByUser, scenario.totalScenarios);
              return (
                <li key={scenario.title} className="scenario-list-item">
                  <div
                    className="scenario-card"
                    style={{ "--completion-percent": `${completionPercent}%` }}
                    onClick={() => navigate(`/scenarios/${scenario.reference}/${practiceMode ? 'practice' : 'review'}`)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigate(`/scenarios/${scenario.reference}/${practiceMode ? 'practice' : 'review'}`); } }}
                    aria-label={`Open scenario: ${scenario.title}`}
                  >
                  <img src={scenario.image} alt={scenario.title} className="scenario-card-img" />
                  <div className="scenario-card-title">
                    {scenario.title}
                  </div>
                </div>
              </li>
            )}
          )}
          </ul>
          <div>
            <label className="switch">
              <input type="checkbox" checked={practiceMode} onChange={e => setPracticeMode(e.target.checked)} />
              <span className="slider round"></span>
            </label>
            <span style={{ textAlign: 'center' }}>   Practice Mode (shows answers to choose from)</span>
          </div>
        </div>
    </div>
    </>
  );
}

export async function loader () {
  try {
    const response = await api.get(`/scenarios/`);
    return { initialScenarios: response.data };
  } catch (error) {
    console.log(error);
    return { initialScenarios: [] };
  }
}