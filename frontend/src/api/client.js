const BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001/api";

export const api = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || `Request failed (${res.status})` };
    return data;
  } catch {
    return { error: "Cannot reach the server. Start the backend: cd backend && python app.py" };
  }
};

export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: "POST", body: JSON.stringify(body) });
export const put = (path, body) => api(path, { method: "PUT", body: JSON.stringify(body) });
export const del = (path) => api(path, { method: "DELETE" });
