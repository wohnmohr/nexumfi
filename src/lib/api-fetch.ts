/**
 * Fetch wrapper that adds ngrok-skip-browser-warning header when the URL
 * points to ngrok. This bypasses the ngrok interstitial page (ERR_NGROK_6024)
 * so API calls return JSON instead of HTML.
 */
export async function apiFetch(
  url: string | URL,
  init?: RequestInit
): Promise<Response> {
  const urlStr = typeof url === "string" ? url : url.toString();
  const isNgrok = urlStr.includes("ngrok");

  const headers = new Headers(init?.headers);
  if (isNgrok) {
    headers.set("ngrok-skip-browser-warning", "true");
  }

  return fetch(url, { ...init, headers });
}
