import api from "../api";
import { useLoaderData, useNavigate } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta.js';
import PageHelmet from '../components/PageHelmet.jsx';
import DisplayExplanation from "../DisplayExplanation";

export default function ExplanationPage() {
  
  const navigate = useNavigate();
  const {explanation} = useLoaderData();
  const currentExplanation = explanation.explanations[0];

  const meta = useSEOMeta({
    title: `Learn-Swiss: ${currentExplanation.title}`,
    description: `${currentExplanation.explanation}`,
    canonicalUrl: `https://www.learn-swiss.ch/explanations/${explanation.reference}`,
    keywords: `study tool, Swiss German learning, German, Schweiz, Schwiizerdüütsch, Schwiizertüütsch`,
    schema: { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": `${currentExplanation.title}`, "url": `https://www.learn-swiss.ch/explanations/${explanation.reference}` }
  });

  function onStartChallenge(){
      navigate(`/challenges/${explanation.reference}/practice`);
  }  
  return (
    <>
    <PageHelmet {...meta} />
    <DisplayExplanation key={explanation.reference} explanation={explanation} onStartChallenge={onStartChallenge}/>
    </>
  );
}

export async function loader ({params}) {
  const explanationResponse = await api.get(`/explanations/${params.reference}`);
  const explanation = explanationResponse.data;

  return {explanation};
}