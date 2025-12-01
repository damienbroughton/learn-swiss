import { Link } from "react-router-dom";

export default function ArticlesList({ articles }) {
    return (
        <>
        {articles.map((article) => (
        <Link to={`/articles/${article.name}`} key={article.name}>
            <div>
            <h3>{article.title}</h3>
            <p>{article.content[0].substring(0, 150)}</p>
            </div>
        </Link>
        ))}
        </>
    )
}