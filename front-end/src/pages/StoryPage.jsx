import api from "../api";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import useStoryPolling from "../hooks/useStoryPolling.js"
import FlashCardReview from "../FlashCardReview";
import imgStoriesCH from '../assets/IgelFlashCardWriting.png';
import imgStoriesDE from '../assets/EberFlashCardWriting.png';


export default function StoryPage() {
    const { story: initialStory } = useLoaderData();
    const [showFlashCards, setShowFlashCards] = useState(true);
    const [showStory, setShowStory] = useState(false);

    const { story, isLoading } = useStoryPolling(initialStory.reference, initialStory);

    const title = `Learn-Swiss: ${story.title}`;
    const description = `Practice vocabulary from the story '${story.title}' in ${story.language}.`;
    const canonicalUrl = `https://learn-swiss.ch/stories/${story.reference}`;
    const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

    const hasFlashcards = story?.flashcards?.length > 0;

    // Define the completion handler to navigate back
    const handleReviewComplete = () => {
        setShowFlashCards(false);
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
            {!showFlashCards && hasFlashcards && <button onClick={() => setShowFlashCards(true)}>Retry Flashcards</button>}
            {!hasFlashcards
                && 
                <div className="card" style={{textAlign: "center"}}>
                    <h2>Please wait... {story.language === "Swiss-German" ? "Iggy" : "Eber"} is busy writing your flashcards... </h2>
                    <img src={story.language === "Swiss-German" ? imgStoriesCH : imgStoriesDE} alt="Flash Cards Loading..." />
                </div>
            }
            {showFlashCards  && hasFlashcards && (
                <div className="card" style={{ paddingTop: "2px" }}>
                    <p>First learn the words of the story with: </p>
                    <FlashCardReview 
                        flashcards={story.flashcards} 
                        completeButtonText="Test your comprehension with the story"
                        onComplete={handleReviewComplete} 
                    />
                </div>
            )}
            {!showStory && <button onClick={() => setShowStory(true)}>Show Story</button>}
            {showStory && (
                <div className="container">
                    <div className="card" style={{ whiteSpace: "pre-line", textAlign: "center" }}>
                        <p>{hasFlashcards ? "Now try" : "Try"} your comprehension with the story: </p>
                        {story.content}
                    </div>
                </div>
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