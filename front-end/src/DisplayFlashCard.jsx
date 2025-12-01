export default function DisplayFlashCard({ category, question, answer, formality, previouslyCorrect, setAnswerChecked }) {

    function onFlashCardClick(card) {
        const answerElement = document.getElementById(`answer-${card}`);
        answerElement.textContent = answer;
        answerElement.classList.add('fade-in');
        setAnswerChecked(true);

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
            <p className="flashcard-answer" id={`answer-${question}`}></p>
            <button id={`btnReveal-${question}`} onClick={() => onFlashCardClick(question)}>Reveal</button>
            <p className="flashcard-formality">{formality ? 'Formal' : 'Informal'}</p>
        </div>
        </>
    )
}