import GenerateFlashCardList from "../GenerateFlashCardList.jsx";

export default function MakeFlashCardsPage() {
  return (
    <div className="container center">
        <div className="card" >
            <h1>Generate Flash Cards with AI</h1>
            <p>Paste your text below and we will generate flashcards based on the verbs and nouns within that text. <br /><i>Note: flashcards are generated with AI and subject to mistakes</i></p>
            <GenerateFlashCardList />
        </div>
    </div>
  );
}
