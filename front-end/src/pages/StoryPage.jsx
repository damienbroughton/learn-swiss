import api from "../api";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";


export default function FlashCardPage() {
    const {story} = useLoaderData();

    return (
        <div>
            <h1>Story: {story.title}</h1>
            <div className="container">
                <div className="card" style={{ whiteSpace: "pre-line" }}>
                    {story.content}
                </div>
            </div>
        </div>
    );
}

export async function loader ({params}) {
  const response = await api.get(`/stories/${params.id}`);
  const story = response.data;
  return {story};
}