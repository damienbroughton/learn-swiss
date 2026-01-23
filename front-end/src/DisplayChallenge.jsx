import { useState, useRef } from "react"
import imgChat from './assets/BoarBook.png';

export default function DisplayChallenge({challenge, mode, onNext, recordSuccess }) {

    const [currentOption, setCurrentOption] = useState(challenge.content.baseWord + "___");
    const [hintText, setHintText] = useState("Hint: Click to reveal");
    const [isChecking, setIsChecking] = useState(false);
    const [isCorrect, setIsCorrect] = useState();
    const [attemptNumber, setAttemptNumber] = useState(0);

    const sentenceParts = challenge.content.sentenceTemplate.split("{{target}}");

    function onOptionClick(optionText) {
      setCurrentOption(optionText);
    }

    async function onCheckAnswerClick(text) {
      setIsChecking(true);
      if (text.trim().toLowerCase() === challenge.content.correctAnswer.toLowerCase()) {
        setIsCorrect(true);
        setHintText(`Correct! ${challenge.metadata.explanation}`);
        // Record success only on first attempt
        if(attemptNumber < 1){
          await recordSuccess(challenge._id);
        }
      } else {
        setHintText("Incorrect! Try again or click here to reveal a hint");
        setIsCorrect(false);
      }
      setAttemptNumber(attemptNumber + 1);
      setIsChecking(false);
    }

    return (
        <>
        <div key={challenge.reference}>
          <div className="speech-bubble-npc fade-in" style={{width: "87%"}}>
            <img src={imgChat} alt="Chatting Hedgehog" style={{ float:'left', marginRight: '10px' }} />
            <h4>{sentenceParts[0]}<u>{currentOption}</u>{sentenceParts[1]}</h4>
            <br />
            <div>
              {mode === 'practice' && isCorrect !== true && challenge.content.options.map((optionText, index) => (
                <button key={`${index}`} 
                  style={{ margin: '1%' }}               
                  className="answerbutton"
                  onClick={() => onOptionClick(optionText)}>
                  {optionText}
                </button>
              ))}
            </div>
            <button
              id={`check-answer-button-${challenge.reference}`}
              style={{ float: 'right', marginRight: '6%' }}
              className="answerbutton"
              hidden={isCorrect === true}
              onClick={() => { onCheckAnswerClick(currentOption); }}>
              {isChecking ? 'Checking..' : 'Check Answer'}
            </button>
            <button
              id={`next-button-${challenge.reference}`}
              className="answerbutton"
              style={{ float: 'right', marginRight: '6%' }}
              hidden={isCorrect !== true}
              onClick={() => { onNext(); }}>
              {isChecking ? 'Loading..' : 'Next'}
            </button>
            <p onClick={() => setHintText(`Hint: ${challenge.metadata.noun}`)}>{hintText}</p>
          </div>
        </div>
        </>
    )
}