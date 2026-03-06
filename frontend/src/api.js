const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function shortenUrl(url) {
  const response = await fetch(`${API_BASE_URL}/api/shorten`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}
