/** Regras espelhadas da API (para prévias na tela; a API é a fonte da verdade). */
export const DIFICULDADES = ['Fácil', 'Médio', 'Difícil'];
export const TIPOS = ['Tipo 1', 'Tipo 2', 'Tipo 3', 'Tipo 4'];
export const TIPO_QUIZ = 'Tipo 2';
export const XP = { 'Fácil': 75, 'Médio': 100, 'Difícil': 150 };
export const PENALIDADE = { 'Fácil': -15, 'Médio': -25, 'Difícil': -75 };

const nf = new Intl.NumberFormat('pt-BR');
const nf2 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export const num = (n) => nf.format(n ?? 0);
export const dec = (n) => nf2.format(n ?? 0);
export const pct = (n) => `${nf2.format(n ?? 0)}%`;

export function rotuloTipo(tipo) {
  return tipo === TIPO_QUIZ ? `${tipo} · Quiz` : tipo;
}

/** Código de QR aleatório e legível, ex.: FATEC-K7Q2XM-042 */
export function gerarCodigoQr() {
  const bloco = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FATEC-${bloco}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
}
