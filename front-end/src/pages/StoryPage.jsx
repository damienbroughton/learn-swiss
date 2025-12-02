import api from "../api";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import FlashCardReview from "../FlashCardReview";


export default function FlashCardPage() {
    const {story} = useLoaderData();
    const [showFlashCards, setShowFlashCards] = useState(true);
    const [showStory, setShowStory] = useState(false);

    // Define the completion handler to navigate back
    const handleReviewComplete = () => {
        setShowFlashCards(false);
        setShowStory(true);
    };

    return (
        <div>
            <h1>Story: {story.title}</h1>
            {!showFlashCards && <button onClick={() => setShowFlashCards(true)}>Retry Flashcards</button>}
            {showFlashCards && (
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
                    <p>Now try your comprehension with the story: </p>
                    <div className="card" style={{ whiteSpace: "pre-line" }}>
                        {story.content}
                    </div>
                </div>
            )}
        </div>
    );
}

export async function loader ({params}) {
  const response = await api.get(`/stories/${params.id}`);
  const story = response.data;
  return {story};
}