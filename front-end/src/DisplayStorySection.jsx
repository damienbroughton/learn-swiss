export default function DisplayStorySection({ id, sectionText }) {

    return (
        <div className="container" key={id}>
            <div className="card" style={{ whiteSpace: "pre-line", textAlign: "center" }}>
                <p>{sectionText}</p>
            </div>
        </div>
    )
}