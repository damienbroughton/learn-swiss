import api from "../api";
import { useState, useEffect } from "react"
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';

export default function ScenarioListPage() {
  const {scenarios} = useLoaderData();

  const title = `Learn-Swiss: Scenarios`;
  const description = `Learn Swiss-German stories by practicing common scenarios!`;
  const canonicalUrl = `https://learn-swiss.ch/scenarios`;
  const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

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
        <h1>Scenarios</h1>
        <p>{description}</p>
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
                  onClick={() => navigate(`/scenarios/${scenario.title}/${practiceMode ? 'practice' : 'review'}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigate(`/scenarios/${scenario.title}/${practiceMode ? 'practice' : 'review'}`); } }}
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