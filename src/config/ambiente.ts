export const API_PADRAO =
  "https://gerenciamentoestacionamento-ru6m.onrender.com";
export const baseUrl = (
  import.meta.env.VITE_API_BASE_URL?.trim() || API_PADRAO
).replace(/\/+$/, "");
export const timeoutMs = 90_000;