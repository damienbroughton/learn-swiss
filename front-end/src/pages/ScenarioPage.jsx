import api from "../api";
import { useState } from "react";
import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';
import DisplayScenario from "../DisplayScenario";
import imgCelebration from '../assets/HedgeHogCelebration.png';
import useUser from "../hooks/useUser";

export default function ScenarioPage() {
    const navigate = useNavigate();
    const { mode } = useParams();
    const {scenario} = useLoaderData();
    const { user } = useUser();

    const meta = useSEOMeta({
      title: `Learn-Swiss: ${scenario.title} - Practice Real-World Dialogue`,
      description: `Practice real-world conversation in the '${scenario.title}' scenario. Learn Swiss-German vocabulary and dialogue patterns in context.`,
      canonicalUrl: `https://www.learn-swiss.ch/scenarios/${scenario.title}/${mode}`,
      keywords: `${scenario.title}, Swiss German scenario, conversation practice, dialogue learning`,
      schema: { "@context": "https://schema.org", "@type": "LearningResource", "name": `${scenario.title} - Practice Real-World Dialogue`, "url": `https://www.learn-swiss.ch/scenarios/${scenario.title}/${mode}`, "learningResourceType": "Interactive scenario", "inLanguage": "en" }
    });

    const [shownSteps, setShownSteps] = useState([scenario.steps[0]]); // start with first step
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
            if (currentStepIndex + 1 < scenario.steps.length) {
              setShownSteps([...shownSteps, scenario.steps[currentStepIndex + 1]]);
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
      const requestBody = { contentId: scenario._id, type: 'scenario', isCorrect: true, mode: mode };
      await api.post(`/userProgress`, requestBody);
    }
  }

  return (
    <>
    <PageHelmet {...meta} />
    <div>
      <h1>{scenario.title}</h1>
      <p>Category: {scenario.category} | Difficulty: {scenario.difficulty} | Tags: {scenario.tags.join(', ')}</p>
      {shownSteps.map((step, index) => (
        <DisplayScenario key={index} step={step} mode={mode} onCheckAnswer={onCheckAnswer} />
      ))}
      {currentStepIndex === scenario.steps.length && (
        <div className="container">
          <div className="card" style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '1.5em 1em', boxSizing: 'border-box', textAlign: 'center' }}>                            
            <img src={imgCelebration} alt="Celebrating Hedgehog"  className="button-icon" />
            <p>Congratulations! You've completed the scenario.</p>
            <button onClick={() => navigate('/scenarios')}>Try another Scenario</button>
          </div>
        </div>
      )}

    </div>
  </>
  );
}

export async function loader ({params}) {
  const response = await api.get(`/scenarios/${params.reference}`);
  const scenario = response.data;
  return {scenario};
}
