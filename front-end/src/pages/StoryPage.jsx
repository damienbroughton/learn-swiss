import api from "../api";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import useStoryPolling from "../hooks/useStoryPolling.js"
import FlashCardReview from "../FlashCardReview";
import DisplayStorySection from "../DisplayStorySection";
import imgStoriesCH from '../assets/IgelFlashCardWriting.png';
import imgStoriesDE from '../assets/EberFlashCardWriting.png';
import imgError from '../assets/ErrorImage.png';


export default function StoryPage() {
    const { story: initialStory } = useLoaderData();
    const [showFlashCards, setShowFlashCards] = useState(true);
    const [showStory, setShowStory] = useState(false);
    const [currentSection, setCurrentSection] = useState(initialStory.sections != null 
        ? initialStory.sections[0] 
        : {sectionId: initialStory.id, sectionContent: initialStory.content});

    const { story, isLoading } = useStoryPolling(initialStory.reference, initialStory);

    const title = `Learn-Swiss: ${story.title}`;
    const description = `Practice vocabulary from the story '${story.title}' in ${story.language}.`;
    const canonicalUrl = `https://learn-swiss.ch/stories/${story.reference}`;
    const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

    const hasFlashcards = currentSection?.flashcards?.length > 0;

    // Define the completion handler to navigate back
    const handleReviewComplete = () => {
        setShowFlashCards(false);
        setShowStory(true);
    };

    const handleStoryButton = () => {
        setCurrentSection({sectionId: initialStory.id, sectionContent: initialStory.content})
        setShowStory(true);
    };

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
        <div>
            <h1>{story.title}</h1>
            <ul className="scenario-list">
                {story.sections && story.sections.map(section => (
                <li key={section.sectionId} style={{listStyle: "none"}}>
                    <button
                    onClick={() => setCurrentSection({...story.sections[section.sectionId-1]})}
                    disabled={section.sectionId === currentSection.sectionId}
                    >{section.sectionId}</button>
                </li>
                ))}
                <li key="Story" style={{listStyle: "none"}}>
                    <button onClick={() => handleStoryButton()}>Story</button>
                </li>
            </ul>
            {currentSection.error !== undefined && 
                <div className="card" style={{textAlign: "center"}}>
                    <h2>{story.language === "Swiss-German" ? "Iggy" : "Eber"} had an issue writing the flashcards for this section!</h2>
                    <p>{currentSection.error}</p>
                    <img src={imgError} alt="Flash Cards Loading..." />
                </div>
            }
            {!hasFlashcards && currentSection.sectionId !== story.id && currentSection.error === undefined
                && 
                <div className="card" style={{textAlign: "center"}}>
                    <h2>Please wait... {story.language === "Swiss-German" ? "Iggy" : "Eber"} is busy writing your flashcards... </h2>
                    <img src={story.language === "Swiss-German" ? imgStoriesCH : imgStoriesDE} alt="Flash Cards Loading..." />
                </div>
            }
            {!showFlashCards && hasFlashcards && <button onClick={() => setShowFlashCards(true)}>Retry Flashcards</button>}
            {showFlashCards && currentSection.sectionId !== "ALL"  && hasFlashcards && (
                <div className="card" style={{ paddingTop: "2px" }}>
                    <p>First learn the words of the story with: </p>
                    <FlashCardReview 
                        flashcards={currentSection.flashcards} 
                        completeButtonText="Test your comprehension with the story"
                        onComplete={handleReviewComplete} 
                    />
                </div>
            )}
            {!showStory && <button onClick={() => setShowStory(true)}>Show Content</button>}
            {showStory && (
                <DisplayStorySection 
                    id={currentSection.sectionId} 
                    sectionText={currentSection.sectionContent}
                />
            )}
        </div>
        </>
    );
}

export async function loader ({params}) {
  const response = await api.get(`/stories/${params.reference}`);
  const story = response.data;
  return {story};
}