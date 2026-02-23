import { Helmet } from 'react-helmet-async';
import GenerateFlashCardList from "../GenerateFlashCardList.jsx";

export default function MakeFlashCardsPage() {
  const title = `Learn-Swiss: Generate Flash Cards with AI`;
  const description = `Use AI to generate your own story with flashcards to help learn Swiss-German and German in context.`;
  const canonicalUrl = `https://www.learn-swiss.ch/make-flashcards`;
  const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };
  
  return (
    <>
    <Helmet>
        {/* Dynamic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(storySchema)}</script>
    </Helmet>
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
