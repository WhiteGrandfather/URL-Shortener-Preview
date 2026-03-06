import { useState } from "react";
import { shortenUrl } from "./api";
import PreviewCard from "./components/PreviewCard";
import UrlForm from "./components/UrlForm";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [result, setResult] = useState(null);

  async function handleShortenSubmit(url) {
    setLoading(true);
    setRequestError("");

    try {
      const data = await shortenUrl(url);
      setResult(data);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unexpected error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>URL Shortener & Preview</h1>
      <p className="subtitle">Create short links and preview Open Graph metadata.</p>

      <UrlForm onSubmit={handleShortenSubmit} loading={loading} />

      {requestError ? <p className="error">{requestError}</p> : null}

      {result ? (
        <section className="result">
          <p>
            Short URL:{" "}
            <a href={result.shortUrl} target="_blank" rel="noreferrer">
              {result.shortUrl}
            </a>
          </p>

          <PreviewCard
            title={result.preview?.title}
            description={result.preview?.description}
            image={result.preview?.image}
          />
        </section>
      ) : null}
    </main>
  );
}
