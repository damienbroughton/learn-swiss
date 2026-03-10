import { useState } from "react"
import imgNeutralDE from './assets/Eber-Neutral.png';
import imgConfusedDE from './assets/Eber-Confused.png';
import imgHappyDE from './assets/Eber-Happy.png';


export default function DisplayChallenge({challenge, mode, onNext, recordSuccess }) {

    const [currentOption, setCurrentOption] = useState(challenge.content.showBaseWord ? challenge.content.baseWord + "___" : "______");
    const [hintText, setHintText] = useState("Hint: Click to reveal");
    const [isChecking, setIsChecking] = useState(false);
    const [isCorrect, setIsCorrect] = useState();
    const [attemptNumber, setAttemptNumber] = useState(0);
    const [image, setImage] = useState(imgNeutralDE);

    const sentenceParts = challenge.content.sentenceTemplate.split("{{target}}");

    function onOptionClick(optionText) {
      setCurrentOption(optionText);
    }

    async function onCheckAnswerClick(text) {
      setIsChecking(true);
      if (text.trim().toLowerCase() === challenge.content.correctAnswer.toLowerCase()) {
        setIsCorrect(true);
        setImage(imgHappyDE);
        setHintText(`Correct! ${challenge.metadata.explanation}`);
        // Record success only on first attempt
        if(attemptNumber < 1){
          await recordSuccess(challenge._id);
        }
      } else {
        setImage(imgConfusedDE);
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
            <img src={image} alt="Chatting Hedgehog" style={{ float:'left', marginRight: '10px', maxWidth: '180px', width: '50%' }} />
            <h4>{sentenceParts[0]}<u>{currentOption}</u>{sentenceParts[1]}</h4>
            <br />
            <br />
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
              className="btn-success"
              hidden={isCorrect === true}
              onClick={() => { onCheckAnswerClick(currentOption); }}>
              {isChecking ? 'Checking..' : 'Check Answer'}
            </button>
            <button
              id={`next-button-${challenge.reference}`}
              className="btn-success"
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