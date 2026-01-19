import { useState, useRef } from "react"
import imgChat from './assets/BoarBook.png';

export default function DisplayChallenge({challenge, mode, onNext }) {

    const [currentOption, setCurrentOption] = useState(challenge.content.baseWord + "___");
    const [hintText, setHintText] = useState("Hint: Click to reveal");
    const [isChecking, setIsChecking] = useState(false);
    const [isCorrect, setIsCorrect] = useState();
    const inputRef = useRef();

    const sentenceParts = challenge.content.sentenceTemplate.split("{{target}}");

    function onOptionClick(optionText) {
      setCurrentOption(optionText);
    }

    function onCheckAnswerClick(text) {
      setIsChecking(true);
      if (text.trim().toLowerCase() === challenge.content.correctAnswer.toLowerCase()) {
        setIsCorrect(true);
        setIsChecking(false);
        setHintText(`Correct! ${challenge.metadata.explanation}`);
      } else {
        setHintText("Incorrect! Try again or click here to reveal a hint");
        setIsChecking(false);
        setIsCorrect(false);
      }
    }

    return (
        <>
        <div key={challenge.reference}>
          <div className="speech-bubble-npc fade-in" style={{width: "87%"}}>
            <img src={imgChat} alt="Chatting Hedgehog" style={{ float:'left', marginRight: '10px' }} />
            <h2>{sentenceParts[0]}<u>{currentOption}</u>{sentenceParts[1]}</h2>
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