// src/utils/api.js
const API_BASE = process.env.REACT_APP_API_URL || ""; // ensure this is set if needed

function buildHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function apiFetch(path, { method = "GET", body, token, params } = {}) {
  let url = API_BASE + path;
  if (params) url += `?${new URLSearchParams(params).toString()}`;

  const res = await fetch(url, {
    method,
    headers: buildHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });

  const rawText = await res.text();

  const contentType = res.headers.get("content-type") || "";

  // If server returned HTML (index.html or error page), throw detailed error
  if (contentType.includes("text/html") || rawText.trim().startsWith("<")) {
    const err = new Error(
      `Expected JSON but received HTML. HTTP ${res.status} ${res.statusText} for ${url}`
    );
    err.status = res.status;
    err.url = url;
    err.rawText = rawText.slice(0, 2000); // limit size
    throw err;
  }

  // if empty body
  if (!rawText) {
    if (!res.ok) {
      const err = new Error(`Empty response with status ${res.status}`);
      err.status = res.status;
      err.url = url;
      throw err;
    }
    return null;
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (parseErr) {
    const err = new Error(`Failed to parse JSON from ${url}: ${parseErr.message}`);
    err.status = res.status;
    err.url = url;
    err.rawText = rawText.slice(0, 2000);
    throw err;
  }

  if (!res.ok) {
    const err = new Error(data?.message || `API error ${res.status}`);
    err.status = res.status;
    err.payload = data;
    err.url = url;
    throw err;
  }

  return data;
}
