import { useState } from "react"

export default function AddCommentForm({ onAddComment }) {
    const [nameText, setNameText] = useState("");
    const [commentText, setCommentText] = useState("");

    return (
        <div>
            <h3>Add a comment</h3>
            <label>Name:
                <input type="text" value ={nameText} onChange={(e) => setNameText(e.target.value)} />
            </label>
            <label>Comment:
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>
            </label>
            <button onClick={() => {
                onAddComment({ nameText, commentText });
                setNameText("");
                setCommentText("");
            }}>Submit</button>
        </div>
    )

}
