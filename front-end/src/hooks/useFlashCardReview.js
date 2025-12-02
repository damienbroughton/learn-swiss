import { useState, useCallback, useMemo } from "react";
import api from "../api"; 
import useUser from "./useUser"; 

/**
 * Custom hook to manage the state and logic for flashcard review.
 * @param {Array} initialFlashcards - The initial array of flashcard objects.
 * @returns {Object} State and functions for the flashcard review.
 */
export function useFlashCardReview(initialFlashcards) {
  // Use a copy of the initial array for the deck state
  const [flashcardDeck, setFlashcardDeck] = useState([...initialFlashcards]);
  const [numCorrect, setNumCorrect] = useState(0);
  const [numIncorrect, setNumIncorrect] = useState(0);
  const [answerChecked, setAnswerChecked] = useState(false);

  const { user } = useUser();

  // Function to get the next random card and remove it from the deck
  const getNextCard = useCallback((currentCards) => {
    if (currentCards.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * currentCards.length);
    const randomCard = currentCards[randomIndex];
    
    // Create a new array for the state update
    const newDeck = [...currentCards];
    newDeck.splice(randomIndex, 1);
    setFlashcardDeck(newDeck);

    return randomCard;
  }, []); // Dependencies are empty as it relies only on internal state/logic

  // Initialize the current flashcard
  const [flashcard, setFlashcard] = useState(() => getNextCard([...initialFlashcards]));

  // API function to mark the card as guessed
  const completeCard = useCallback(async ({ guessedCorrectly, cardToComplete }) => {
    if (!cardToComplete) return;

    if (user !== null) {
      await api.post(`/flashcards/${cardToComplete._id}/guess`, { guessedCorrectly });
    }
  }, [user]);

  // Handler for a correct guess (Thumbs Up)
  const onThumbsUp = useCallback(() => {
    if (!flashcard) return;
    setNumCorrect(c => c + 1);
    completeCard({ guessedCorrectly: true, cardToComplete: flashcard });
    setAnswerChecked(false);
    setFlashcard(getNextCard(flashcardDeck)); // Pass the current deck state
  }, [flashcard, flashcardDeck, completeCard, getNextCard]);

  // Handler for an incorrect guess (Thumbs Down)
  const onThumbsDown = useCallback(() => {
    if (!flashcard) return;
    setNumIncorrect(c => c + 1);
    completeCard({ guessedCorrectly: false, cardToComplete: flashcard });
    setAnswerChecked(false);
    setFlashcard(getNextCard(flashcardDeck)); // Pass the current deck state
  }, [flashcard, flashcardDeck, completeCard, getNextCard]);

  // Handler for an incorrect guess (Thumbs Down)
  const onRetryDeck = useCallback(() => {
    setNumCorrect(0);
    setNumIncorrect(0);
    setAnswerChecked(false);
    setFlashcardDeck([...initialFlashcards]);
    setFlashcard(getNextCard([...initialFlashcards])); // Pass the current deck state
  }, [flashcard, flashcardDeck, completeCard, getNextCard]);

  // Memoize the previous score calculation
  const previousScore = useMemo(() => {
    return initialFlashcards.filter(card => card.userGuess?.guessedCorrectly).length;
  }, [initialFlashcards]);
  
  // Memoize the final state object
  const reviewState = useMemo(() => ({
    flashcard,
    numCorrect,
    numIncorrect,
    answerChecked,
    flashcardDeckLength: flashcardDeck.length,
    totalCards: initialFlashcards.length,
    previousScore,
    setAnswerChecked,
    onThumbsUp,
    onThumbsDown,
    onRetryDeck
  }), [
    flashcard,
    numCorrect,
    numIncorrect,
    answerChecked,
    flashcardDeck.length,
    initialFlashcards.length,
    previousScore,
    setAnswerChecked,
    onThumbsUp,
    onThumbsDown,
    onRetryDeck
  ]);

  return reviewState;
}