import api from "../api";
import { useState } from "react";
import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import DisplayChallenge from "../DisplayChallenge";
import imgCelebration from '../assets/HedgeHogCelebration.png';
import useUser from "../hooks/useUser";

export default function ChallengePage() {
  const navigate = useNavigate();
  const { mode } = useParams();
  const {challengeList} = useLoaderData();
  const { user } = useUser();

  const [currentChallengeList, setCurrentChallengeList] = useState(challengeList); // start with first step
  const [currentChallenge, setCurrentChallenge] = useState(challengeList[0]); // start with first step
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const pageTitle = `Learn-Swiss: ${currentChallenge.title}`;
  const description = `Challenge yourself with '${currentChallenge.title}' in ${currentChallenge.language}.`;
  const canonicalUrl = `https://learn-swiss.ch/stories/${currentChallenge.reference}/${mode}`;
  const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": pageTitle, "description": description, "url": canonicalUrl };

  async function onNext() {
    // Show next step if available
    setCurrentStepIndex(currentStepIndex + 1);
    if (currentStepIndex + 1 < challengeList.length) {
      setCurrentChallenge(currentChallengeList[currentStepIndex + 1]);
    } else {
      console.log("All challenges completed");
    }
  }

  async function onRetry () {
    const response = await api.get(`/challenges/${currentChallenge.reference}`);
    setCurrentStepIndex(0);
    setCurrentChallengeList(response.data);
    setCurrentChallenge(response.data[0]);
  }

  return (
    <>
    <Helmet>
        {/* Dynamic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={currentChallenge.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(storySchema)}</script>
    </Helmet>
    <div className="container center">
      <div className="card" style={{textAlign: "center"}}>
        <h1>{currentChallenge.title}</h1>
        {currentStepIndex !== challengeList.length && (
          <DisplayChallenge key={`${currentChallenge.reference}-${currentStepIndex}`} challenge={currentChallenge} mode={mode} onNext={onNext} />
        )}
        {currentStepIndex === challengeList.length && (
            <div style={{ textAlign: 'center' }}>
              <img src={imgCelebration} alt="Celebrating Hedgehog" style={{ display: 'block', margin: '0 auto' }} />
              <p>Congratulations! You've completed all the challenges.</p>
              <button onClick={() => onRetry()}>Try again with different challenges</button>
              <button onClick={() => navigate(`/challenges`)}>Back to challenges</button>
            </div>
        )}
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
