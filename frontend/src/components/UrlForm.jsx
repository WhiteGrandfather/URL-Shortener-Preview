import { useState } from "react";

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function UrlForm({ onSubmit, loading }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!isValidHttpUrl(url)) {
      setError("Enter a valid HTTP/HTTPS URL");
      return;
    }

    setError("");
    onSubmit(url);
  }

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <label htmlFor="url-input">Long URL</label>
      <div className="row">
        <input
          id="url-input"
          type="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
