import api from "../api";
import { useState, useEffect } from "react"
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';

export default function ScenarioListPage() {
  const {scenarios} = useLoaderData();

  const meta = useSEOMeta({
    title: `Learn-Swiss: Scenarios - Practice Real-World Swiss-German Conversations`,
    description: `Learn Swiss-German through realistic scenarios and conversations. Practice common situational dialogues to improve comprehension and speaking skills.`,
    canonicalUrl: `https://www.learn-swiss.ch/scenarios`,
    keywords: `Swiss German scenarios, conversation practice, Schwiizertüütsch dialogues, situational learning`,
    schema: { "@context": "https://schema.org", "@type": "CollectionPage", "headline": "Scenarios", "description": "Practice real-world conversations", "url": "https://www.learn-swiss.ch/scenarios" }
  });

  const [practiceMode, setPracticeMode] = useState(() => {
    const saved = localStorage.getItem("practiceMode");
    return saved === "true"; // convert string to boolean
  });

  useEffect(() => {
    localStorage.setItem("practiceMode", practiceMode);
  }, [practiceMode]);

  const navigate = useNavigate();

  return (
    <>
    <PageHelmet {...meta} />
    <div className="container center">
      <div className="card" >
        <h1>Scenarios</h1>
        <p>{meta.description}</p>
        <div>
            <label className="switch">
              <input type="checkbox" checked={practiceMode} onChange={e => setPracticeMode(e.target.checked)} />
              <span className="slider round"></span>
            </label>
            <span style={{ textAlign: 'center' }}>   Practice Mode (shows answers to choose from)</span>
          </div>
          <ul className="scenario-list">
            {scenarios.map(scenario => (
              <li key={scenario.title} className="scenario-list-item">
                <div
                  className="scenario-card"
                  onClick={() => navigate(`/scenarios/${scenario.reference}/${practiceMode ? 'practice' : 'review'}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigate(`/scenarios/${scenario.reference}/${practiceMode ? 'practice' : 'review'}`); } }}
                  aria-label={`Open scenario: ${scenario.title}`}
                >
                  <img src={scenario.image} alt={scenario.title} className="scenario-card-img" />
                  <div className="scenario-card-title">
                    {scenario.title}
                    {scenario.previouslyComplete && (<span> ✅</span>)}
                  </div>
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
  try {
    const response = await api.get(`/scenarios/`);
    return { scenarios: response.data };
  } catch (error) {
    console.log(error);
    return { scenarios: [] };
  }
}