import api from "../api";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import useStoryPolling from "../hooks/useStoryPolling.js"
import useUser from "../hooks/useUser";
import FlashCardReview from "../FlashCardReview";
import DisplayStorySection from "../DisplayStorySection";
import imgStoriesCH from '../assets/IgelFlashCardWriting.png';
import imgStoriesDE from '../assets/Eber-FlashCardWriting.png';
import imgError from '../assets/ErrorImage.png';
import gifLoading from '../assets/LoadingAnimation.gif';



export default function StoryPage() {
    const { story: initialStory } = useLoaderData();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [showStory, setShowStory] = useState(false);
    const [isReviewingFlashcards, setIsReviewingFlashcards] = useState(true);

    const { story, isLoading } = useStoryPolling(initialStory.reference, initialStory);
    const { user } = useUser();

    useEffect(() => {
        // Check if there's a saved section index in metadata
        const sectionIndex = story.metadata?.sectionIndex;
        if (sectionIndex !== undefined && sectionIndex >= 0 && sectionIndex < story.sections?.length) {
            setCurrentSectionIndex(sectionIndex);
        } else {
            setCurrentSectionIndex(0);
        }
        setShowStory(false);
        setIsReviewingFlashcards(true);
    }, [story]);

    const title = `Learn-Swiss: ${story.title}`;
    const description = `Practice vocabulary from the story '${story.title}' in ${story.language}.`;
    const canonicalUrl = `https://learn-swiss.ch/stories/${story.reference}`;
    const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

    const currentSection = story.sections?.[currentSectionIndex];
    const hasFlashcards = currentSection?.flashcards?.length > 0;
    const isLastSection = currentSectionIndex >= story.sections?.length - 1;

    // Handle completing flashcard review
    const handleReviewComplete = () => {
        setIsReviewingFlashcards(false);
        setShowStory(true);
    };

    // Handle moving to next section
    const handleNextSection = async () => {
        await completeStorySection();
        if (!isLastSection) {
            setCurrentSectionIndex(currentSectionIndex + 1);
            setShowStory(false);
            setIsReviewingFlashcards(true);
        }
    };

    // Handle reviewing flashcards again
    const handleReviewAgain = () => {
        setIsReviewingFlashcards(true);
        setShowStory(false);
    };

    // Handle skipping flashcards
    const handleSkipFlashcards = () => {
        setIsReviewingFlashcards(false);
        setShowStory(true);
    };

    const completeStorySection = async () => {
        if(user){
            const requestBody = { 
                contentId: story.id, 
                type: 'story', 
                isCorrect: true, 
                metadata: { sectionIndex: currentSectionIndex + 1 } 
            };
            await api.post(`/userProgress`, requestBody);
        }
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
            
            {/* Section Progress Indicator */}
            {story.sections && story.sections.length > 0 && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {story.sections.map((section, idx) => (
                            <button
                                key={section.sectionId}
                                disabled={idx !== currentSectionIndex}
                                style={{
                                    opacity: idx === currentSectionIndex ? 1 : 0.6,
                                    cursor: idx === currentSectionIndex ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Section {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && 
                <div className="card" style={{textAlign: "center"}}>
                    <h2>Please wait... {story.language === "Swiss-German" ? "Iggy" : "Eber"} is busy writing your flashcards... </h2>
                    <img src={story.language === "Swiss-German" ? imgStoriesCH : imgStoriesDE} alt="Flash Cards Loading..." />
                </div>
            }

            {/* Error State */}
            {currentSection?.error !== undefined && 
                <div className="card" style={{textAlign: "center"}}>
                    <h2>{story.language === "Swiss-German" ? "Iggy" : "Eber"} had an issue writing the flashcards for this section!</h2>
                    <p>{currentSection.error}</p>
                    <img src={imgError} alt="Error generating flashcards" />
                    <button onClick={handleSkipFlashcards} style={{ marginTop: '10px' }}>
                        Skip to Story
                    </button>
                </div>
            }

            {/* Step 1: Learn Flashcards */}
            {!isLoading && isReviewingFlashcards && currentSection && hasFlashcards && (
                <div className="card" style={{ paddingTop: "2px" }}>
                    <p>Let's start with the vocabulary from this section. Learn these words before reading the story.</p>
                    <FlashCardReview 
                        flashcards={currentSection.flashcards} 
                        completeButtonText="Read the story section"
                        onComplete={handleReviewComplete} 
                    />
                    <button 
                        onClick={handleSkipFlashcards}
                        style={{ marginTop: '10px', marginLeft: '10px', opacity: 0.7 }}
                    >
                        Skip to Story
                    </button>
                </div>
            )}

            {/* Step 2: Read Story Section */}
            {!isLoading && showStory && currentSection && (
                <div>
                    <DisplayStorySection 
                        id={currentSection.sectionId} 
                        sectionText={currentSection.sectionContent}
                    />
                    
                    {/* Action Buttons After Reading */}
                    <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {hasFlashcards && (
                            <button onClick={handleReviewAgain}>
                                Review Words Again
                            </button>
                        )}
                        {!isLastSection && (
                            <button onClick={handleNextSection} style={{ fontWeight: 'bold' }}>
                                Next Section
                            </button>
                        )}
                        {isLastSection && (
                            <div style={{ textAlign: 'center' }}>
                                <p>🎉 Congratulations! You've completed the story.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* No Flashcards Case */}
            {!isLoading && !hasFlashcards && currentSection && (
                <div className="card">
                    <p>No flashcards for this section. Here's the story:</p>
                    <DisplayStorySection 
                        id={currentSection.sectionId} 
                        sectionText={currentSection.sectionContent}
                    />
                    {!isLastSection && (
                        <button onClick={handleNextSection} style={{ marginTop: '10px', fontWeight: 'bold' }}>
                            Next Section
                        </button>
                    )}
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