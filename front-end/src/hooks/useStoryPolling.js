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

                // Check if flashcards have been generated
                if(newStory.flashcards && newStory.flashcards.length > 0) {
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