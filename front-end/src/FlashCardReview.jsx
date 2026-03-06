import { useFlashCardReview } from "./hooks/useFlashCardReview";
import DisplayFlashCard from "./DisplayFlashCard";


/**
 * Component for conducting a flashcard review session.
 * @param {Object} props
 * @param {Array} props.flashcards - The deck of flashcards to review.
 * @param {string} props.completeButtonText - text to display on complete button
 * @param {Function} props.onComplete - Callback function when the deck is finished.
 * @param {string} props.sourcePage - The source page for the flashcard review (e.g., "flashcards", "stories").
 */
export default function FlashCardReview({ flashcards, completeButtonText, onComplete, sourcePage }) {
  const {
    flashcard,
    numCorrect,
    numIncorrect,
    flashcardDeckLength,
    totalCards,
    previousScore,
    setAnswerChecked,
    onThumbsUp,
    onThumbsDown,
    onRetryDeck
  } = useFlashCardReview(flashcards, sourcePage);

  return (
    <div>
      {flashcard && (
        <DisplayFlashCard 
          key={flashcard._id} 
          category={flashcard.category} 
          question={flashcard.secondLanguageText} 
          answer={flashcard.firstLanguageText} 
          formality={flashcard.formal} 
          previouslyCorrect={flashcard.successes > 0} 
          setAnswerChecked={setAnswerChecked} 
          onThumbsDown={onThumbsDown}
          onThumbsUp={onThumbsUp}
        />
      )}

      {/* Display Score and Remaining Cards */}
      <div className="container">
        <div className="card" style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '1.5em 1em', boxSizing: 'border-box', textAlign: 'center' }}>
          <p>👍 {numCorrect} | 👎 {numIncorrect} | Remaining: {flashcardDeckLength}</p>
          {/* {previousScore > 0 && <p>Previous Score: {previousScore} / {totalCards}</p>} */}
          
          {/* Display completion message if the deck is empty */}
          {!flashcard && (
            <div>
              <p>You've completed the deck with a score of {numCorrect} out of {numCorrect + numIncorrect}!</p>
              {/* onComplete is a prop passed to handle navigation back */}
              <div className='button-container'>
                <button className='feedback-btn btn-success' onClick={onComplete}>{completeButtonText}</button>
                <button className='feedback-btn' onClick={onRetryDeck}>
                  Retry Deck
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}