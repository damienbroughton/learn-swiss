import { useState, useEffect } from "react";
import api from "../api";

function useStoryPolling(storyReference, initialStory, interval = 5000) {
    const [story, setStory] = useState(initialStory);
    const [isLoading, setIsLoading] = useState(true);

    useEffect (() => {
        if(story?.flashcards?.length > 0){
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

                const allSectionsFinished = newStory.sections && newStory.sections.length > 0 && newStory.sections.every(section => {
                    const hasFlashcards = section.flashcards && section.flashcards.length > 0;
                    const hasError = section.error !== undefined;
                    return hasFlashcards || hasError;
                });

                // Check if flashcards have been generated
                if(allSectionsFinished) {
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