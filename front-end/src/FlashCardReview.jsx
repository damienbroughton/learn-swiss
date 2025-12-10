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
        <>
        <h1>{flashcard.category}</h1>
        <DisplayFlashCard 
          key={flashcard._id} 
          category={flashcard.category} 
          question={flashcard.secondLanguageText} 
          answer={flashcard.firstLanguageText} 
          formality={flashcard.formal} 
          previouslyCorrect={flashcard.userGuess?.guessedCorrectly} 
          setAnswerChecked={setAnswerChecked} 
        />
        </>
      )}
      
      {/* Display Thumbs Up/Down buttons if answer is checked */}
      { answerChecked && (
        <>
          <p>Did you guess correctly?</p>
          <button id="btnThumbsUp" onClick={onThumbsUp}>
            <img src={imgThumbsUp} alt="Iggy" style={{ display: 'block', margin: '0 auto' , maxWidth: '30%' }} />
            Yes
          </button>
          <button id="btnThumbsDown" onClick={onThumbsDown}>
            <img src={imgThumbsDown} alt="Iggy" style={{ display: 'block', margin: '0 auto', maxWidth: '30%' }} />
            No
          </button>
        </>
      )}

      {/* Display Score and Remaining Cards */}
      <div className="container">
        <div className="card" style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '2.5em 2em', boxSizing: 'border-box', textAlign: 'center' }}>
          <p>Number correct: {numCorrect}</p>
          <p>Number incorrect: {numIncorrect}</p>
          <p>Number remaining: {flashcardDeckLength}</p>
          <p>Previous Score: {previousScore} / {totalCards}</p>
          
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