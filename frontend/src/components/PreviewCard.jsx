export default function PreviewCard({ title, description, image }) {
  return (
    <article className="preview-card">
      {image ? (
        <img src={image} alt={title || "Open Graph preview"} className="preview-image" />
      ) : (
        <div className="preview-image placeholder">No image</div>
      )}
      <div className="preview-content">
        <h2>{title || "No title"}</h2>
        <p>{description || "No description"}</p>
      </div>
    </article>
  );
}
