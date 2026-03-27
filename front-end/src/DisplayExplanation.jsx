import { useState } from "react";
import imgDE from './assets/Eber-Neutral.png';
import imgCH from './assets/Iggy-Neutral.png';

export default function DisplayExplanation({ explanation, onStartChallenge }) {

    const [currentExplanation, setCurrentExplanation] = useState(explanation.explanations[0]);

    function onLanguageClick(selectedLanguage){
        const currentExplanation = explanation.explanations.find(concept => concept.language === selectedLanguage);
        setCurrentExplanation(currentExplanation);
    }

    return (
        <div className="container" key={explanation.reference}>
            <div className="card" style={{ whiteSpace: "pre-line", textAlign: "center" }}>
                {explanation.explanations.map(concept => (
                    <button 
                        onClick={() => {onLanguageClick(concept.language)}} 
                        key={concept.language}
                        disabled={concept.language == currentExplanation.language}
                        style={{
                            opacity: concept.language == currentExplanation.language ? 0.6 : 1
                        }}
                        >{concept.language}
                    </button>
                ))}
                <h2>{currentExplanation.title}</h2>
                <p>{currentExplanation.explanation}</p>
                <h3>Examples</h3>
                <p>{currentExplanation.example}</p>
                <img src={currentExplanation.language == "German" ? imgDE : imgCH} alt="Iggy the Hedgehog mascot" className="homepage-img" />
                <button 
                    onClick={() => {onStartChallenge()}} 
                    className="btn-success">
                    {currentExplanation.language == "German" ? "Herausforderung starten" : "Start Challenge"}
                </button>
            </div>
        </div>
    )
}