import api from "../api";
import { useState } from "react";
import { useParams, useLoaderData } from "react-router-dom";
import CommentsList from "../CommentsList";
import AddCommentForm from "../AddCommentForm";
import articles from "../article-content";
import useUser from "../hooks/useUser";

export default function ArticlePage() {
    const params = useParams();
    const name = params.name;
    const {upvotes: initialUpvotes, comments: initialComments} = useLoaderData();
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [comments, setComments] = useState(initialComments);

    const { isLoading, user } = useUser();

    const article = articles.find(article => article.name === name);

    async function onUpvoteClicked() {
      const token = user && await user.getIdToken();
      const headers = token ? { authtoken: token } : {};
      const response = await api.post(`/articles/${name}/upvote`, null, { headers });
      const updatedArticleData = response.data;
      setUpvotes(updatedArticleData.upvotes);
    }

    async function onAddComment({nameText, commentText}) {
      const token = user && await user.getIdToken();
      const headers = token ? { authtoken: token } : {};
      const response = await api.post(`/articles/${name}/comment`, { postedBy: nameText, text: commentText }, { headers });
      const updatedArticleData = response.data;
      setComments(updatedArticleData.comments);
    }

  return (
    <>
    <div>
      <h1>{article.title}</h1>
      {user && <button onClick={onUpvoteClicked}>Upvote</button>}
      <p>This article has {upvotes} upvotes</p>
      {article.content.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
    {user && <AddCommentForm onAddComment={onAddComment} />}
    <CommentsList comments={comments} />
  </>
  );
}

export async function loader ({params}) {
  const response = await api.get(`/articles/${params.name}`);
  const {upvotes, comments} = response.data;
  return {upvotes, comments};
}
