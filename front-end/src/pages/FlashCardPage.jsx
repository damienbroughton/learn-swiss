import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import FlashCardReview from "../FlashCardReview";
import api from "../api"; 

export default function FlashCardPage() {
  const { flashcards } = useLoaderData();
  const navigate = useNavigate();

  const category = flashcards[0].category;
  const title = `Learn-Swiss: ${category} flashcards`;
  const description = `Practice vocabulary from the category: '${category}' in ${flashcards[0].secondLanguage}.`;
  const canonicalUrl = `https://learn-swiss.ch/stories/${category}`;
  const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

  // Define the completion handler to navigate back
  const handleReviewComplete = () => {
    navigate('/flashcards');
  };

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
    <FlashCardReview 
      flashcards={flashcards}
      completeButtonText="Back to flashcards"
      onComplete={handleReviewComplete}
    />
    </>
  );
}

export async function loader ({params}) {
  const response = await api.get(`/flashcards/${params.category}`);
  const flashcards = response.data;
  return {flashcards};
}