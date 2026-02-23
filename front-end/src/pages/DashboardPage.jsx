import api from "../api";
import { useLoaderData, Link, useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { getAuth, signOut } from "firebase/auth";
import useAppUser from '../hooks/useAppUser';
import imgFlashCards from '../assets/HedgeHogFlashCards.png';
import imgChallenges from '../assets/Eber-Happy.png';
import imgStories from '../assets/HedgeHogBook.png';
import imgScenarios from '../assets/HedgehogGruezi.png';


export default function Dashboard() {
  const { summary, totals } = useLoaderData();
  const { appUser, isLoading } = useAppUser();

  const title = `Learn-Swiss: Dashboard`;
  const description = `Your learning progress in German and Swiss-German — today and all time.`;
  const canonicalUrl = `https://www.learn-swiss.ch/dashboard`;
  const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

  const navigate = useNavigate();

  // Helper to render a content type card on mobile
  const renderMobileCard = (type, icon, label) => {
    const data = summary?.[type] || {};
    return (
      <div key={type} className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <img src={icon} alt={label} className="scenario-card-img" style={{ width: '60px', marginRight: '1rem' }} />
          <h3 style={{ margin: 0 }}>{label}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <strong>German</strong>
            <p style={{ margin: '0.5rem 0' }}>Today: {data?.German?.todaySuccesses ?? 0}</p>
            <p style={{ margin: '0.5rem 0' }}>All time: {data?.German?.allTimeSuccesses ?? 0}</p>
          </div>
          <div>
            <strong>Swiss-German</strong>
            <p style={{ margin: '0.5rem 0' }}>Today: {data?.['Swiss-German']?.todaySuccesses ?? 0}</p>
            <p style={{ margin: '0.5rem 0' }}>All time: {data?.['Swiss-German']?.allTimeSuccesses ?? 0}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
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
          <h1>Dashboard</h1>
          <p>{description}</p>

          {isLoading ? (
            <p>Loading your account...</p>
          ) : !appUser ? (
            <div className="card">
              <h2>Sign in to view your Dashboard</h2>
              <p>This page shows your personal progress. Please sign in to see your learning statistics.</p>
              <div style={{marginTop: '1rem'}}>
                <Link className="button" to="/login">Sign in</Link>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="table-wrapper" style={{ display: 'none' }} id="desktop-view">
                <table className="table compact">
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{textAlign: "center"}}></th>
                      <th colSpan={2} style={{textAlign: "center"}}>German</th>
                      <th colSpan={2} style={{textAlign: "center"}}>Swiss-German</th>
                      <th colSpan={2} style={{textAlign: "center"}}>Overall</th>
                    </tr>
                    <tr>
                      <th className="numeric">Today</th>
                      <th className="numeric">All time</th>
                      <th className="numeric">Today</th>
                      <th className="numeric">All time</th>
                      <th className="numeric">Today</th>
                      <th className="numeric">All time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><button onClick={() => navigate('/flashcards')}><img src={imgFlashCards} alt="Hedgehog with flashcards" className="scenario-card-img" /><br />Flashcards</button></td>
                      <td className="numeric">{summary?.flashcard?.German?.todaySuccesses ?? 0}</td>
                      <td className="numeric">{summary?.flashcard?.German?.allTimeSuccesses ?? 0}</td>
                      <td className="numeric">{summary?.flashcard['Swiss-German']?.todaySuccesses ?? 0}</td>
                      <td className="numeric">{summary?.flashcard['Swiss-German']?.allTimeSuccesses ?? 0}</td>
                      <td className="numeric">{( (summary?.flashcard?.German?.todaySuccesses||0) + (summary?.flashcard['Swiss-German']?.todaySuccesses||0) + (summary?.flashcard?.Unknown?.todaySuccesses||0) )}</td>
                      <td className="numeric">{( (summary?.flashcard?.German?.allTimeSuccesses||0) + (summary?.flashcard['Swiss-German']?.allTimeSuccesses||0) + (summary?.flashcard?.Unknown?.allTimeSuccesses||0) )}</td>
                    </tr>
                    <tr>
                      <td><button onClick={() => navigate('/challenges')}><img src={imgChallenges} alt="Boar with challenges" className="scenario-card-img" /><br />Challenges</button></td>
                      <td className="numeric">{summary?.challenge?.German?.todaySuccesses ?? 0}</td>
                      <td className="numeric">{summary?.challenge?.German?.allTimeSuccesses ?? 0}</td>
                      <td className="numeric">{summary?.challenge['Swiss-German']?.todaySuccesses ?? 0}</td>
                      <td className="numeric">{summary?.challenge['Swiss-German']?.allTimeSuccesses ?? 0}</td>
                      <td className="numeric">{( (summary?.challenge?.German?.todaySuccesses||0) + (summary?.challenge['Swiss-German']?.todaySuccesses||0) + (summary?.challenge?.Unknown?.todaySuccesses||0) )}</td>
                      <td className="numeric">{( (summary?.challenge?.German?.allTimeSuccesses||0) + (summary?.challenge['Swiss-German']?.allTimeSuccesses||0) + (summary?.challenge?.Unknown?.allTimeSuccesses||0) )}</td>
                    </tr>
                    <tr>
                      <td><button onClick={() => navigate('/stories')}><img src={imgStories} alt="Hedgehog with stories" className="scenario-card-img" /><br />Stories</button></td>
                      <td className="numeric">{summary?.story?.German?.todaySuccesses ?? 0}</td>
                      <td className="numeric">{summary?.story?.German?.allTimeSuccesses ?? 0}</td>
                      <td className="numeric">{summary?.story['Swiss-German']?.todaySuccesses ?? 0}</td>
                      <td className="numeric">{summary?.story['Swiss-German']?.allTimeSuccesses ?? 0}</td>
                      <td className="numeric">{( (summary?.story?.German?.todaySuccesses||0) + (summary?.story['Swiss-German']?.todaySuccesses||0) + (summary?.story?.Unknown?.todaySuccesses||0) )}</td>
                      <td className="numeric">{( (summary?.story?.German?.allTimeSuccesses||0) + (summary?.story['Swiss-German']?.allTimeSuccesses||0) + (summary?.story?.Unknown?.allTimeSuccesses||0) )}</td>
                    </tr>
                    <tr>
                      <td><button onClick={() => navigate('/scenarios')}><img src={imgScenarios} alt="Hedgehog with scenarios" className="scenario-card-img" /><br />Scenarios</button></td>
                      <td className="numeric">{summary?.scenario?.German?.todaySuccesses ?? 0}</td>
                      <td className="numeric">{summary?.scenario?.German?.allTimeSuccesses ?? 0}</td>
                      <td className="numeric">{summary?.scenario['Swiss-German']?.todaySuccesses ?? 0}</td>
                      <td className="numeric">{summary?.scenario['Swiss-German']?.allTimeSuccesses ?? 0}</td>
                      <td className="numeric">{( (summary?.scenario?.German?.todaySuccesses||0) + (summary?.scenario['Swiss-German']?.todaySuccesses||0) + (summary?.scenario?.Unknown?.todaySuccesses||0) )}</td>
                      <td className="numeric">{( (summary?.scenario?.German?.allTimeSuccesses||0) + (summary?.scenario['Swiss-German']?.allTimeSuccesses||0) + (summary?.scenario?.Unknown?.allTimeSuccesses||0) )}</td>
                    </tr>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td className="numeric"><strong>{totals?.German?.todaySuccesses ?? 0}</strong></td>
                      <td className="numeric"><strong>{totals?.German?.allTimeSuccesses ?? 0}</strong></td>
                      <td className="numeric"><strong>{totals?.['Swiss-German']?.todaySuccesses ?? 0}</strong></td>
                      <td className="numeric"><strong>{totals?.['Swiss-German']?.allTimeSuccesses ?? 0}</strong></td>
                      <td className="numeric"><strong>{totals?.overall?.todaySuccesses ?? 0}</strong></td>
                      <td className="numeric"><strong>{totals?.overall?.allTimeSuccesses ?? 0}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div id="mobile-view" style={{ display: 'none' }}>
                <h3>Progress by Category</h3>
                {renderMobileCard('flashcard', imgFlashCards, 'Flashcards')}
                {renderMobileCard('challenge', imgChallenges, 'Challenges')}
                {renderMobileCard('story', imgStories, 'Stories')}
                {renderMobileCard('scenario', imgScenarios, 'Scenarios')}
                
                {/* Mobile totals */}
                <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#fff5f5' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>Overall Total</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <strong>German</strong>
                      <p style={{ margin: '0.5rem 0' }}>Today: {totals?.German?.todaySuccesses ?? 0}</p>
                      <p style={{ margin: '0.5rem 0' }}>All time: {totals?.German?.allTimeSuccesses ?? 0}</p>
                    </div>
                    <div>
                      <strong>Swiss-German</strong>
                      <p style={{ margin: '0.5rem 0' }}>Today: {totals?.['Swiss-German']?.todaySuccesses ?? 0}</p>
                      <p style={{ margin: '0.5rem 0' }}>All time: {totals?.['Swiss-German']?.allTimeSuccesses ?? 0}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Overall</strong>
                      <p style={{ margin: '0.5rem 0' }}>Today: {totals?.overall?.todaySuccesses ?? 0}</p>
                      <p style={{ margin: '0.5rem 0' }}>All time: {totals?.overall?.allTimeSuccesses ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <style>{`
                @media (max-width: 768px) {
                  #desktop-view { display: none !important; }
                  #mobile-view { display: block !important; }
                }
                @media (min-width: 769px) {
                  #desktop-view { display: block !important; }
                  #mobile-view { display: none !important; }
                }
              `}</style>

            </>
          )}
        </div>
        {appUser && <button style={{float: "right", margin: "10px"}} onClick={() => signOut(getAuth())}>Sign Out</button>}
      </div>
    </>
  );
}

export async function loader () {
  try {
    const response = await api.get(`/userProgress/summary`);
    return response.data;
  } catch (err) {
    // If user is not authenticated or API fails, return empty summary so the page can render safely
    const emptyLang = { German: { todaySuccesses: 0, allTimeSuccesses: 0 }, 'Swiss-German': { todaySuccesses: 0, allTimeSuccesses: 0 }, Unknown: { todaySuccesses: 0, allTimeSuccesses: 0 } };
    return { summary: { flashcard: emptyLang, challenge: emptyLang, story: emptyLang, scenario: emptyLang }, totals: { German: { todaySuccesses: 0, allTimeSuccesses: 0 }, 'Swiss-German': { todaySuccesses: 0, allTimeSuccesses: 0 }, overall: { todaySuccesses: 0, allTimeSuccesses: 0 } } };
  }
}
