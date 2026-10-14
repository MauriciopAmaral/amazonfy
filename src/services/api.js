// Cliente da API PHP. Por padrão usa o mesmo domínio do site (/api).
// Para usar outro endereço, crie um .env com VITE_API_URL=https://seusite.com/api
const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = { "X-Requested-With": "XMLHttpRequest" };
  let realMethod = method;

  // Alguns servidores compartilhados bloqueiam PUT/DELETE: enviamos como POST + override.
  if (method === "PUT" || method === "DELETE") {
    headers["X-HTTP-Method-Override"] = method;
    realMethod = "POST";
  }
  if (body !== undefined && !isForm) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: realMethod,
      headers,
      credentials: "include",
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Sem conexão com o servidor. Verifique sua internet.", 0);
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Resposta não-JSON: geralmente a API não está publicada ou o PHP deu erro.
    throw new ApiError(
      response.ok
        ? "A API respondeu em um formato inesperado. Confira se a pasta /api foi enviada ao servidor."
        : `Erro ${response.status} ao acessar a API.`,
      response.status
    );
  }

  if (!response.ok) {
    throw new ApiError(data?.error || `Erro ${response.status}`, response.status, data?.fields);
  }
  return data;
}

export const api = {
  catalog: () => request("/catalog"),

  me: () => request("/auth/me"),
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: { name, email, password } }),
  logout: () => request("/auth/logout", { method: "POST", body: {} }),

  create: (resource, data) => request(`/${resource}`, { method: "POST", body: data }),
  update: (resource, id, data) => request(`/${resource}/${id}`, { method: "PUT", body: data }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: "DELETE" }),

  upload: (file, kind) => {
    const form = new FormData();
    form.append("kind", kind);
    form.append("file", file);
    return request("/upload", { method: "POST", body: form, isForm: true });
  },
};
