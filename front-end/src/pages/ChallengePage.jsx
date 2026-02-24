import api from "../api";
import { useState } from "react";
import { useParams, useLoaderData, useNavigate, Link } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';
import DisplayChallenge from "../DisplayChallenge";
import imgCelebration from '../assets/Eber-Celebration.png';
import gifLoading from '../assets/LoadingAnimation.gif';
import useUser from "../hooks/useUser";

export default function ChallengePage() {
  const navigate = useNavigate();
  const { mode } = useParams();
  const {challengeList} = useLoaderData();
  const { user } = useUser();

  const [currentChallengeList, setCurrentChallengeList] = useState(challengeList); // start with first step
  const [currentChallenge, setCurrentChallenge] = useState(challengeList[0]); // start with first step
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [numCorrect, setNumCorrect] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const meta = useSEOMeta({
    title: `Learn-Swiss: ${currentChallenge.title} - Test Your Skills`,
    description: `Challenge yourself with '${currentChallenge.title}' in ${currentChallenge.language}. Practice and test your Swiss-German comprehension and vocabulary.`,
    canonicalUrl: `https://www.learn-swiss.ch/challenges/${currentChallenge.reference}/${mode}`,
    keywords: `Swiss German challenge, comprehension exercise, language practice, ${currentChallenge.language}`,
    schema: { "@context": "https://schema.org", "@type": "LearningResource", "name": `${currentChallenge.title} - Test Your Skills`, "url": `https://www.learn-swiss.ch/challenges/${currentChallenge.reference}/${mode}`, "learningResourceType": "Practice exercise", "inLanguage": "en" }
  });

  async function onNext() {
    // Show next step if available
    setCurrentStepIndex(currentStepIndex + 1);
    if (currentStepIndex + 1 < challengeList.length) {
      setCurrentChallenge(currentChallengeList[currentStepIndex + 1]);
    }
  }

  async function onRetry () {
    setIsLoading(true);
    // Fetch a new set of challenges
    const response = await api.get(`/challenges/${currentChallenge.reference}`);
    setCurrentStepIndex(0);
    setNumCorrect(0);
    setCurrentChallengeList(response.data);
    setCurrentChallenge(response.data[0]);
    setIsLoading(false);
  }

  // Record success to user progress
  async function recordSuccess(challengeId) {
    setNumCorrect(numCorrect + 1);
    if(user){
      const requestBody = { contentId: challengeId, type: 'challenge', isCorrect: true, mode: mode };
      await api.post(`/userProgress`, requestBody);
    }
  }

  return (
    <>
    <PageHelmet {...meta} />
    <div className="container center">
      <div className="card" style={{textAlign: "center"}}>
        <h2>{currentChallenge.title}</h2>
        {(currentStepIndex < challengeList.length)}
        {currentStepIndex !== challengeList.length && (
          <DisplayChallenge key={`${currentChallenge.reference}-${currentStepIndex}`} challenge={currentChallenge} mode={mode} onNext={onNext} recordSuccess={recordSuccess} />
        )}
        {currentStepIndex === challengeList.length && (
            <div style={{ textAlign: 'center' }}>
              <img src={imgCelebration} alt="Celebrating Hedgehog" style={{ width: '75%', maxWidth: '300px' }} />
              <p>Hurra! You scored {numCorrect} out of {challengeList.length} on the challenges. <br /> You can play again with a different set of challenges.</p>
              <button onClick={() => onRetry()}>Play again</button>
              <button onClick={() => navigate(`/challenges`)}>Back to challenges</button>
              {!user && <p><Link to={`/login`} key="Login">Sign in</Link> to save your progress</p>}
            </div>
        )}
        {isLoading && <img src={gifLoading} style={{ width: '30px', height: '30px'}}/>}
      </div>
    </div>
    <div className="container">
        <div className="card" style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '1.5em 1em', boxSizing: 'border-box', textAlign: 'center' }}>
          <p>Score: {numCorrect} | Remaining: {challengeList.length - currentStepIndex}</p>
        </div>
    </div>
  </>
  );
}

export async function loader ({params}) {
  const response = await api.get(`/challenges/${params.reference}`);
  const challengeList = response.data;
  return {challengeList};
}
