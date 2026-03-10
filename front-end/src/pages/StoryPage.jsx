import api from "../api";
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';
import useStoryPolling from "../hooks/useStoryPolling.js"
import useUser from "../hooks/useUser";
import FlashCardReview from "../FlashCardReview";
import DisplayStorySection from "../DisplayStorySection";
import imgStoriesCH from '../assets/IgelFlashCardWriting.png';
import imgStoriesDE from '../assets/Eber-FlashCardWriting.png';
import imgCelebrationCH from '../assets/HedgeHogCelebration.png';
import imgCelebrationDE from '../assets/Eber-Celebration.png';
import imgError from '../assets/ErrorImage.png';



export default function StoryPage() {
    const navigate = useNavigate();
    const { story: initialStory } = useLoaderData();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [showStorySection, setShowStorySection] = useState(false);
    const [showCompleteStory, setShowCompleteStory] = useState(false);
    const [storyComplete, setStoryComplete] = useState(false);
    const [isReviewingFlashcards, setIsReviewingFlashcards] = useState(true);

    const { story, isLoading } = useStoryPolling(initialStory.reference, initialStory);
    const { user } = useUser();

    useEffect(() => {
        // Check if there's a saved section index in metadata
        const sectionIndex = story.metadata?.sectionIndex;
        if (sectionIndex !== undefined && sectionIndex >= 0 && sectionIndex < story.sections?.length) {
            setCurrentSectionIndex(sectionIndex);
            setShowCompleteStory(false);
        } 
        else if (sectionIndex === story.sections?.length) {
            setCurrentSectionIndex(sectionIndex);
            setShowCompleteStory(true);
            setStoryComplete(true);
        } else {
            setCurrentSectionIndex(0);
            setShowCompleteStory(false);
        }
        setShowStorySection(false);
        setIsReviewingFlashcards(true);
    }, [story]);

    const title = `Learn-Swiss: ${story.title} - Read Swiss-German Stories`;
    const description = `Read the story '${story.title}' in ${story.language}. ${story.content.substring(0, 150)}`;
    const canonicalUrl = `https://www.learn-swiss.ch/stories/${story.reference}`;
    const meta = useSEOMeta({
      title: title,
      description: description,
      canonicalUrl: canonicalUrl,
      keywords: `${story.title}, Swiss German story, reading practice, language learning, ${story.language}`,
      schema: { "@context": "https://schema.org", "@type": "LearningResource", "name": title, "description": description, "url": canonicalUrl, "learningResourceType": "Interactive story", "inLanguage": "en" }
    });

    const currentSection = story.sections?.[currentSectionIndex];
    const hasFlashcards = currentSection?.flashcards?.length > 0;
    const isLastSection = currentSectionIndex >= story.sections?.length - 1;

    // Handle completing flashcard review
    const handleReviewComplete = () => {
        setIsReviewingFlashcards(false);
        setShowStorySection(true);
    };

    // Handle navigating to a section
    const handleShowSection = (sectionIndex) => {
        setCurrentSectionIndex(sectionIndex);
        setShowStorySection(false);
        setShowCompleteStory(false);
        setIsReviewingFlashcards(true);
    };

    // Handle navigating to final section
    const handleShowFinalSection = () => {
        setShowStorySection(false);
        setIsReviewingFlashcards(false);
        setShowCompleteStory(true);
    };

    // Handle moving to next section
    const handleNextSection = async () => {
        await completeStorySection();
        if (!isLastSection) {
            setCurrentSectionIndex(currentSectionIndex + 1);
            setShowStorySection(false);
            setIsReviewingFlashcards(true);
        }
    };

    // Handle moving to next section
    const handleFinalSection = async () => {
        await completeStorySection();
        handleShowFinalSection();
    };

    // Handle reviewing flashcards again
    const handleReviewAgain = () => {
        setIsReviewingFlashcards(true);
        setShowStorySection(false);
    };

    // Handle skipping flashcards
    const handleSkipFlashcards = () => {
        setIsReviewingFlashcards(false);
        setShowStorySection(true);
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
        <PageHelmet {...meta} />
        <div>
            <h1>{story.title}</h1>
            
            {/* Section Progress Indicator */}
            {story.sections && story.sections.length > 0 && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {story.sections.map((section, idx) => {
                            const isDisabled = !storyComplete && idx !== currentSectionIndex;

                            return (
                                <button
                                    key={section.sectionId}
                                    disabled={isDisabled}
                                    style={{
                                        opacity: isDisabled ? 0.6 : 1,
                                        cursor: isDisabled ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={() => handleShowSection(idx)}
                                >
                                    Section {idx + 1}
                                </button>
                            );
                        })}
                        <button
                            key="complete-story-button"
                            onClick={() => handleShowFinalSection()}
                        >
                            Full Story
                        </button>
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
                        sourcePage="StoryPage" 
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
            {!isLoading && showStorySection && currentSection && (
                <div>
                    <DisplayStorySection 
                        id={currentSection.sectionId} 
                        sectionText={currentSection.sectionContent}
                    />
                    
                    {/* Action Buttons After Reading */}
                    <div className="container">
                        <div className="card" style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '1.5em 1em', boxSizing: 'border-box', textAlign: 'center' }}>                            
                            {isLastSection && (
                                <div style={{ textAlign: 'center' }}>
                                    <img src={story.language === "Swiss-German" ? imgCelebrationCH : imgCelebrationDE} alt="Iggy" className="button-icon" />
                                    <p>Congratulations! You have finished the last section.</p>
                                    <button onClick={handleFinalSection} className='btn-success'>
                                        Complete Story
                                    </button>
                                </div>
                            )}
                            {!isLastSection && (
                                <button onClick={handleNextSection} className='btn-success'>
                                    Next Section
                                </button>
                            )}
                            {hasFlashcards && (
                                <button onClick={handleReviewAgain}>
                                    Review Words Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Step Final: Read the complete story */}
            {showCompleteStory && (
                <div>
                    <DisplayStorySection 
                        id="complete-story"
                        sectionText={story.content}
                    />
                    <button onClick={() => navigate('/stories')}>Try another Story</button>
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