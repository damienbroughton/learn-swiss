import { useState, useRef } from "react"
import imgChat from './assets/HedgeHogChat.png';

export default function DisplayScenario({step, mode, onCheckAnswer }) {

    const [responseText, setResponseText] = useState("");
    const [translationText, setTranslationText] = useState("Click to see translation");
    const [hintText, setHintText] = useState("Hint: Click to reveal");
    const [isChecking, setIsChecking] = useState(false);
    const [isCorrect, setIsCorrect] = useState();
    const [successReply, setSuccessReply] = useState(null);
    const [successReplyTranslationText, setSuccessReplyTranslationText] = useState("Click to see translation");
    const inputRef = useRef();

    function onLetterClick(letter) {
      setResponseText(prev => prev + letter);
      inputRef.current?.focus();
    }

    function onExampleClick(exampleText) {
      setResponseText(exampleText);
      onCheckAnswerClick(exampleText); // pass directly
    }

    function onCheckAnswerClick(text) {
      setIsChecking(true);
      onCheckAnswer({step, responseText: text}, ({success, hint, reply}) => {
          if (!success) {
            setIsChecking(false);
            setHintText(hint ? `Hint: ${hint}` : "Hint: Try again or click to reveal a hint");
            setIsCorrect(false);
            setTimeout(() => setIsCorrect(), 500); // remove shake after animation
          } else {
            setIsCorrect(true);
            setSuccessReply(reply.text ? reply : null);
          }
        });
    }

    return (
        <>
        <div key={step.order}>
          <div className="speech-bubble-npc fade-in">
            <img src={imgChat} alt="Chatting Hedgehog" style={{ float:'left', marginRight: '10px' }} />
            <h2>{step.text}</h2>
            <p onClick={() => setTranslationText(step.translation)} key={step.translation}>{translationText}</p>
          </div>
          <div className={`speech-bubble-user ${responseText === "" ? "fade-in" : ""} ${isCorrect === false ? "shake" : ""}`}>
            <label>{step.instruction} 
              <input id={`response-${step.order}`}
              type="text" 
              value={responseText} 
              onChange={e => setResponseText(e.target.value)} 
              onKeyDown={e => {
                if (e.key === 'Enter' && isCorrect !== true) {
                  document.getElementById(`check-answer-button-${step.order}`).click();
                }
              }} 
              readOnly={isCorrect === true} autoFocus ref={inputRef}/>
            </label>
            {isCorrect === true && <p style={{ color: 'green', float: 'right' }}>✅ Correct!</p>}
            <button
              id={`check-answer-button-${step.order}`}
              style={{ float: 'right', marginRight: '6%' }}
              hidden={isCorrect === true || mode === 'practice'}
              onClick={() => { onCheckAnswerClick(responseText); }}>
            {isChecking ? 'Checking..' : 'Check Answer'}
            </button>
            {isCorrect !== true && mode === 'review' && 
            <>
              {['ä', 'ö', 'ü', 'ß'].map(l => (
                <button key={l} type="button" onClick={() => onLetterClick(l)}>{l}</button>
              ))}
            </>
            }
            {mode === 'practice' && isCorrect !== true && step.expectedResponses.map((expectedResponse, index) => (
              expectedResponse.exampleResponses.map((exampleResponse, pIndex) => (
                <button key={`${index}-${pIndex}`} style={{ margin: '1%' }}
                   onClick={() => onExampleClick(exampleResponse)}>
                  {exampleResponse}
                </button>
              ))
            ))}
            <p onClick={() => setHintText(`Hint: ${step.expectedResponses[0].hints[0]}`)}>{hintText}</p>
          </div>
          {successReply && <div className="speech-bubble-npc fade-in">
            <img src={imgChat} alt="Chatting Hedgehog" style={{ float:'left', marginRight: '10px' }} />
            <h2>{successReply.text}</h2>
            <p onClick={() => setSuccessReplyTranslationText(successReply.translation)} key={successReply.translation}>{successReplyTranslationText}</p>
          </div>}
        </div>
        </>
    )
}