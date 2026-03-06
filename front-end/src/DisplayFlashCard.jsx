import imgThumbsDown from './assets/Iggy-ThumbsDown.png'; 
import imgThumbsUp from './assets/Iggy-ThumbsUp.png'; 
import { useState } from "react";

export default function DisplayFlashCard({ category, question, answer, formality, previouslyCorrect, onThumbsDown, onThumbsUp }) {

    const [answerText, setAnswerText] = useState("");
    const [answerRevealed, setAnswerRevealed] = useState(false);

    function onFlashCardClick(card) {
        const answerElement = document.getElementById(`answer-${card}`);
        setAnswerText(answer);
        answerElement.classList.add('fade-in');
        setAnswerRevealed(true);

        const revealButton = document.getElementById(`btnReveal-${card}`);
        revealButton.style.display = 'none';
    }

    return (
        <>
        <div className="flashcard" key={question}>
            <div className="flashcard-header">
                <p className="flashcard-category">{category}</p>
                <p className="flashcard-previously-correct">{previouslyCorrect ? 'Previously Correct' : null}</p>
            </div>
            <p className="flashcard-question">{question}</p>
            <p className="flashcard-answer" id={`answer-${question}`}>{answerText}</p>
            <button id={`btnReveal-${question}`}  onClick={() => onFlashCardClick(question)}>Reveal</button>
            <p className="flashcard-formality">{formality ? 'Formal' : 'Informal'}</p>
            {/* Display Thumbs Up/Down buttons if answer is checked */}
            { answerRevealed && (
                <>
                <p>Did you guess correctly?</p>
                <div className='button-container'>
                    <button id="btnThumbsUp" className='feedback-btn btn-success' onClick={onThumbsUp}>
                         <img src={imgThumbsUp} alt="Iggy" className="button-icon" />
                         I got it right
                       
                    </button>
                    <button id="btnThumbsDown" className='feedback-btn btn-retry' onClick={onThumbsDown}>
                        <img src={imgThumbsDown} alt="Iggy" className="button-icon" />
                        I need more practice 
                    </button>
                </div>
                </>
            )}
        </div>
        </>
    )
}