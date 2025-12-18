import { useState, useEffect } from "react";
import api from "../api";

function useStoryPolling(storyReference, initialStory, interval = 5000) {
    const [story, setStory] = useState(initialStory);
    const [isLoading, setIsLoading] = useState(true);

    useEffect (() => {
        function allSectionsLoaded(story){
            const allSectionsFinished = story.sections && story.sections.length > 0 && story.sections.every(section => {
                const hasFlashcards = section.flashcards && section.flashcards.length > 0;
                const hasError = section.error !== undefined;
                return hasFlashcards || hasError;
            });
            return(allSectionsFinished);
        }

        if(allSectionsLoaded(initialStory)){
            setIsLoading(false);
            return;
        }

        let timerId;
        let isPolling = true;

        async function poll() {
            try {
                // API endpoint fetches story including flashcards
                const response = await api.get(`/stories/${storyReference}`);
                const newStory = response.data;

                // Check if flashcards have been generated
                if(allSectionsLoaded(newStory)) {
                    setStory(newStory);
                    setIsLoading(false);
                    isPolling = false;
                    clearTimeout(timerId);
                }
            } catch (error) {
                console.error("Polling error:", error);
            }

            if(isPolling) {
                timerId = setTimeout(poll, interval);
            }
        }

        // Start polling immediately
        poll();

        // Clean up function to clear timer when component unmounts
        return () => clearTimeout(timerId);
    }, [storyReference, interval]);

    return { story, isLoading };
}

export default useStoryPolling;