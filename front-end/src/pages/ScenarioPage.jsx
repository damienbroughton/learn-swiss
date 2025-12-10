import api from "../api";
import { useState } from "react";
import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import DisplayScenario from "../DisplayScenario";
import imgCelebration from '../assets/HedgeHogCelebration.png';
import useUser from "../hooks/useUser";

export default function ScenarioPage() {
    const navigate = useNavigate();
    const { mode } = useParams();
    const {title, category, difficulty, tags, steps} = useLoaderData();
    const { user } = useUser();

    const pageTitle = `Learn-Swiss: ${title}`;
    const description = `Practice vocabulary the scenario '${title}' in Swiss-German.`;
    const canonicalUrl = `https://learn-swiss.ch/stories/${title}/${mode}`;
    const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": pageTitle, "description": description, "url": canonicalUrl };

    const [shownSteps, setShownSteps] = useState([steps[0]]); // start with first step
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    async function onCheckAnswer({ step, responseText }, callback) {
      if (responseText.trim() === "") {
        callback({ success: false, hint: "Please enter a response before checking." });
        return;
      }

      // Loop through all expected responses
      for (const expected of step.expectedResponses || []) {
        for (const pattern of expected.patterns) {
          const regex = new RegExp(pattern, "i"); // case-insensitive
          if (regex.test(responseText.trim())) {
            // Return success info + NPC reply
            callback({
              success: true,
              reply: expected.successReply,
            });

            // Show next step if available
            setCurrentStepIndex(currentStepIndex + 1);
            if (currentStepIndex + 1 < steps.length) {
              setShownSteps([...shownSteps, steps[currentStepIndex + 1]]);
            } else {
              completeScenario();
            }
            return;
          }
        }
      }
      callback({ success: false });
  }

  async function completeScenario() {
    if(user && mode === 'review'){
      const token = user && await user.getIdToken();
      const headers = token ? { authtoken: token } : {};
      await api.post(`/scenarios/${title}/complete`, null, { headers });
    }
  }

  return (
    <>
    <Helmet>
        {/* Dynamic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(storySchema)}</script>
    </Helmet>
    <div>
      <h1>{title}</h1>
      <p>Category: {category} | Difficulty: {difficulty} | Tags: {tags.join(', ')}</p>
      {shownSteps.map((step, index) => (
        <DisplayScenario key={index} step={step} mode={mode} onCheckAnswer={onCheckAnswer} />
      ))}
      {currentStepIndex === steps.length && (
          <div style={{ textAlign: 'center' }}>
            <img src={imgCelebration} alt="Celebrating Hedgehog" style={{ display: 'block', margin: '0 auto' }} />
            <p>Congratulations! You've completed the scenario.</p>
            <button onClick={() => navigate('/scenarios')}>Try another Scenario</button>
          </div>
      )}

    </div>
  </>
  );
}

export async function loader ({params}) {
  const response = await api.get(`/scenarios/${params.title}`);
  const {title, category, difficulty, tags, steps} = response.data;
  return {title, category, difficulty, tags, steps};
}
