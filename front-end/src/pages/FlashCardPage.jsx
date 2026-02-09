import { useLoaderData, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import FlashCardReview from "../FlashCardReview";
import api from "../api"; 

export default function FlashCardPage() {
  const { flashcards } = useLoaderData();
  const navigate = useNavigate();

  const category = flashcards[0]?.category || 'Flashcards';
  const title = `Learn-Swiss: ${category} flashcards`;
  const description = `Practice vocabulary from the category: '${category}' in ${flashcards[0]?.secondLanguage || 'Swiss-German'}.`;
  const canonicalUrl = `https://learn-swiss.ch/flashcards/${category}`;
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
  try {
    const response = await api.get(`/flashcards/${params.category}/Swiss-German?forReview=true`);
    const flashcards = response.data;
    return { flashcards };
  } catch (err) {
    if (err && err.response && err.response.status === 401) {
      // Fallback for unauthenticated users: return unfiltered flashcards
      const fallback = await api.get(`/flashcards/${params.category}/Swiss-German`);
      return { flashcards: fallback.data };
    }
    throw err;
  }
}