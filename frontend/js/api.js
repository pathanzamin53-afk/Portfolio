const isLocalFrontend = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);
const API_BASE =
  window.PORTFOLIO_API_URL ||
  (isLocalFrontend ? "http://localhost:5000/api" : "/api");

export async function submitContact(payload) {
  let response;
  try {
    response = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Backend server se connection nahi ho saka. Backend ko port 5000 par start karein.",
    );
  }
  const result = await response.json().catch(() => ({}));
  if (response.status === 429)
    throw new Error(
      "Bahut zyada requests ho gayi hain. Thodi der baad try karein.",
    );
  if (!response.ok)
    throw new Error(result.message || "Unable to send your message.");
  return result;
}
