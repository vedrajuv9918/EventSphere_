const API_BASE = (process.env.REACT_APP_API_URL || "/api").replace(/\/$/, "");

function buildUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

function buildHeaders({ auth, isFormData, extraHeaders }) {
  const headers = { ...(extraHeaders || {}) };

  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  let payload = null;

  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else if (contentType.startsWith("text/")) {
    payload = await response.text();
  }

  if (!response.ok) {
    const message =
      (payload && (payload.error || payload.message)) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

async function request(path, { method = "GET", data, auth = false, isFormData = false, headers } = {}) {
  const options = {
    method,
    headers: buildHeaders({ auth, isFormData, extraHeaders: headers }),
  };

  if (data) {
    options.body = isFormData ? data : JSON.stringify(data);
  }

  const response = await fetch(buildUrl(path), options);
  return parseResponse(response);
}

export const apiClient = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, data, options = {}) => request(path, { ...options, method: "POST", data }),
  put: (path, data, options = {}) => request(path, { ...options, method: "PUT", data }),
  del: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
  upload: (path, formData, options = {}) =>
    request(path, {
      ...options,
      method: options.method || "POST",
      data: formData,
      isFormData: true,
    }),
};
