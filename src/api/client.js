/**
 * Cliente HTTP da Fatec Mission API para o painel administrativo.
 * Guarda o JWT, envia "Authorization: Bearer", converte erros padronizados em ApiError
 * e baixa arquivos (CSV) autenticados.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'fm_admin_token';

export class ApiError extends Error {
  constructor(status, mensagem, detalhes) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes || [];
  }

  /** { campo: mensagem } — para mostrar o erro no input correspondente. */
  get campos() {
    return Object.fromEntries(this.detalhes.map((d) => [d.campo, d.mensagem]));
  }
}

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* armazenamento indisponível */
    }
  },
};

function url(path, query) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([k, v]) => v !== undefined && v !== null && v !== '' && params.set(k, v));
  const qs = params.toString();
  return `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;
}

async function enviar(method, path, { body, query } = {}) {
  const token = tokenStore.get();
  try {
    return await fetch(url(path, query), {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API. Verifique se ela está em execução.');
  }
}

async function tratarErro(res, path) {
  const data = await res.json().catch(() => null);
  if (res.status === 401 && tokenStore.get() && path !== '/login') {
    window.dispatchEvent(new Event('fma:unauthorized'));
  }
  const erro = data?.erro || {};
  throw new ApiError(res.status, erro.mensagem || `Erro inesperado (${res.status}).`, erro.detalhes);
}

async function request(method, path, opts) {
  const res = await enviar(method, path, opts);
  if (!res.ok) await tratarErro(res, path);
  if (res.status === 204) return null;
  return res.json();
}

/** Baixa um arquivo autenticado e dispara o "Salvar como" do navegador. */
async function baixar(path, query, nomePadrao) {
  const res = await enviar('GET', path, { query });
  if (!res.ok) await tratarErro(res, path);
  const nome = /filename="?([^"]+)"?/.exec(res.headers.get('Content-Disposition') || '')?.[1] || nomePadrao;
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  return nome;
}

export const api = {
  login: (email, senha) => request('POST', '/login', { body: { email, senha } }),
  perfil: () => request('GET', '/perfil'),

  dashboard: () => request('GET', '/admin/dashboard'),
  exportarUsuarios: () => baixar('/admin/usuarios', { formato: 'csv' }, 'usuarios.csv'),

  missoes: () => request('GET', '/missoes', { query: { status: 'todas' } }),
  missao: (id) => request('GET', `/missoes/${id}`),
  criarMissao: (dados) => request('POST', '/admin/missoes', { body: dados }),
  editarMissao: (id, dados) => request('PUT', `/admin/missoes/${id}`, { body: dados }),
  alterarStatus: (id, status) => request('PATCH', `/admin/missoes/${id}/status`, { body: { status } }),
  excluirMissao: (id) => request('DELETE', `/admin/missoes/${id}`),

  perguntas: (missaoId) => request('GET', `/admin/missoes/${missaoId}/perguntas`),
  criarPergunta: (missaoId, dados) => request('POST', `/admin/missoes/${missaoId}/perguntas`, { body: dados }),
  editarPergunta: (id, dados) => request('PUT', `/admin/perguntas/${id}`, { body: dados }),
  excluirPergunta: (id) => request('DELETE', `/admin/perguntas/${id}`),
};
