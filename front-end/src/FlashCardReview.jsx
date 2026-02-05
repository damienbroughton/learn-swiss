import { useFlashCardReview } from "./hooks/useFlashCardReview";
import DisplayFlashCard from "./DisplayFlashCard";
import imgThumbsDown from './assets/HedgeHogThumbsDown.png'; 
import imgThumbsUp from './assets/HedgeHogThumbsUp.png'; 


/**
 * Component for conducting a flashcard review session.
 * @param {Object} props
 * @param {Array} props.flashcards - The deck of flashcards to review.
 * @param {string} props.completeButtonText - text to display on complete button
 * @param {Function} props.onComplete - Callback function when the deck is finished.
 */
export default function FlashCardReview({ flashcards, completeButtonText, onComplete }) {
  const {
    flashcard,
    numCorrect,
    numIncorrect,
    answerChecked,
    flashcardDeckLength,
    totalCards,
    previousScore,
    setAnswerChecked,
    onThumbsUp,
    onThumbsDown,
    onRetryDeck
  } = useFlashCardReview(flashcards);

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
        />
      )}
      
      {/* Display Thumbs Up/Down buttons if answer is checked */}
      { answerChecked && (
        <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
          <p>Did you guess correctly?</p>
          <button id="btnThumbsUp" onClick={onThumbsUp}>
            <img src={imgThumbsUp} alt="Iggy" style={{ display: 'block', margin: '0 auto' , maxWidth: '70%' }} />
            Yes
          </button>
          <button id="btnThumbsDown" onClick={onThumbsDown}>
            <img src={imgThumbsDown} alt="Iggy" style={{ display: 'block', margin: '0 auto', maxWidth: '70%' }} />
            No
          </button>
        </div>
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
              <button onClick={onComplete}>{completeButtonText}</button>
              <button style={{marginTop: "5px"}} onClick={onRetryDeck}>Retry Deck</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}