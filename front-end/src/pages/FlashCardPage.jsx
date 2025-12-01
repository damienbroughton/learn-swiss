import api from "../api";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import DisplayFlashCard from "../DisplayFlashCard";
import imgThumbsDown from '../assets/HedgeHogThumbsDown.png';
import imgThumbsUp from '../assets/HedgeHogThumbsUp.png';
import useUser from "../useUser";


export default function FlashCardPage() {
  const {flashcards} = useLoaderData();

  const [flashcardDeck, setFlashcardDeck] = useState([...flashcards]);
  const [flashcard, setFlashcard] = useState(() => getNextCard([...flashcardDeck]));
  const [numCorrect, setNumCorrect] = useState(0);
  const [numIncorrect, setNumIncorrect] = useState(0);
  const [answerChecked, setAnswerChecked] = useState(false);

  const { user } = useUser();

  const navigate = useNavigate();

   const previousScore = flashcards.filter(card => card.userGuess?.guessedCorrectly).length;

  function getNextCard(currentCards){
    if (currentCards.length === 0) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * currentCards.length);
    const randomCard = currentCards[randomIndex];
    currentCards.splice(randomIndex, 1);
    setFlashcardDeck(currentCards);
    return randomCard;
  }

  function onThumbsUp() {
    setNumCorrect(c => c + 1);
    completeCard({guessedCorrectly: true});
    setAnswerChecked(false);
    setFlashcard(getNextCard([...flashcardDeck]));
  }

  function onThumbsDown() {
    setNumIncorrect(c => c + 1);
    completeCard({guessedCorrectly: false});
    setAnswerChecked(false);
    setFlashcard(getNextCard([...flashcardDeck]));
  }

  async function completeCard({guessedCorrectly}) {
    if(user !== null){
      const token = user && await user.getIdToken();
      if (token === null) {
        console.error('No token found');
        return;
      }
      const headers = token ? { authtoken: token } : {};
      await api.post(`/flashcards/${flashcard._id}/guess`, { guessedCorrectly }, { headers });
    }
  }

  return (
    <div>
      <h1>Flash Cards</h1>
      {flashcard && (
        <DisplayFlashCard key={flashcard._id} category={flashcard.category} question={flashcard.secondLanguageText} 
          answer={flashcard.firstLanguageText} formality={flashcard.formal} previouslyCorrect={flashcard.userGuess?.guessedCorrectly} 
          setAnswerChecked={setAnswerChecked} />
      )}
      { answerChecked && (<p>Did you guess correctly?</p>)}
      { answerChecked && (<button id="btnThumbsDown" onClick={() => onThumbsDown()}><img src={imgThumbsDown} alt="Iggy" height="50%" width="50%" style={{ display: 'block', margin: '0 auto' }} />
      No</button>) }
      { answerChecked &&(<button id="btnThumbsUp" onClick={() => onThumbsUp()}  style={{ float: 'right' }}><img src={imgThumbsUp} alt="Iggy" height="50%" width="50%" style={{ display: 'block', margin: '0 auto' }} />
      Yes</button>) }
      <div className="container">
        <div className="card" style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '2.5em 2em', boxSizing: 'border-box', textAlign: 'center' }}>
          <p>Number correct: {numCorrect}</p>
          <p>Number incorrect: {numIncorrect}</p>
          <p>Number remaining: {flashcardDeck.length}</p>
          <p>Previous Score: {previousScore} / {flashcards.length}</p>
          {!flashcard && (<div><p>You've completed the deck with a score of {numCorrect} out of {numCorrect + numIncorrect}!</p>
            <button onClick={() => navigate('/flashcards')}>Go back to the list of flash cards</button>
          </div>)}
        </div>
      </div>
    </div>
  );
}

export async function loader ({params}) {
  const response = await api.get(`/flashcards/${params.category}`);
  const flashcards = response.data;
  return {flashcards};
}