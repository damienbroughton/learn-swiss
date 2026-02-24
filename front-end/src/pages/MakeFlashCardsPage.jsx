import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';
import GenerateFlashCardList from "../GenerateFlashCardList.jsx";

export default function MakeFlashCardsPage() {
  const meta = useSEOMeta({
    title: `Learn-Swiss: AI Flashcard Generator - Create Custom Learning Cards`,
    description: `Use AI to generate custom flashcards from any text. Learn Swiss-German and German faster by creating personalized study materials with intelligent extraction of key vocabulary.`,
    canonicalUrl: `https://www.learn-swiss.ch/make-flashcards`,
    keywords: `AI flashcard generator, study tool, Swiss German learning, custom flashcards, vocabulary builder`,
    schema: { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Generate Flashcards", "url": "https://www.learn-swiss.ch/make-flashcards" }
  });
  
  return (
    <>
    <PageHelmet {...meta} />
    <div className="container center">
        <div className="card" >
            <h1>Generate Flash Cards with AI</h1>
            <p>Insert your text below and we will generate flashcards based on the verbs and nouns within that text. <br /><i>Note: flashcards are generated with AI and subject to mistakes</i></p>
            <GenerateFlashCardList />
        </div>
    </div>
    </>
  );
}
