import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import FlashCardReview from "../FlashCardReview";
import api from "../api"; 

export default function FlashCardPage() {
  const { flashcards } = useLoaderData();
  const navigate = useNavigate();

  // Define the completion handler to navigate back
  const handleReviewComplete = () => {
    navigate('/flashcards');
  };

  return (
    <FlashCardReview 
      flashcards={flashcards}
      completeButtonText="Back to flashcards"
      onComplete={handleReviewComplete}
    />
  );
}

export async function loader ({params}) {
  const response = await api.get(`/flashcards/${params.category}`);
  const flashcards = response.data;
  return {flashcards};
}